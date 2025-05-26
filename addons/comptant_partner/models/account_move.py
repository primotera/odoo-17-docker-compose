from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import date


class AccountMove(models.Model):
    _inherit = 'account.move'

    is_comptant = fields.Boolean(
        string='Comptant',
        default=True,
        help="Cochez cette case si cette facture/avoir est au comptant"
    )
    
    numero_ordre = fields.Char(
        string='Numéro d\'ordre',
        readonly=True,
        copy=False,
        help="Numéro d'ordre de la facture/avoir tenant compte de sa nature comptant ou non"
    )
    
    # Surcharge de la méthode default_get pour définir les valeurs par défaut
    @api.model
    def default_get(self, fields_list):
        # Appel à la méthode parent pour obtenir les valeurs par défaut standards
        defaults = super(AccountMove, self).default_get(fields_list)
        
        # Définir is_comptant à True par défaut
        defaults['is_comptant'] = True
        
        # Si la date de facture n'est pas déjà définie, la définir à aujourd'hui
        if 'invoice_date' in fields_list and 'invoice_date' not in defaults:
            defaults['invoice_date'] = date.today()
            
        # Si la date d'échéance n'est pas déjà définie, la définir à aujourd'hui
        if 'invoice_date_due' in fields_list and 'invoice_date_due' not in defaults:
            defaults['invoice_date_due'] = date.today()
            
        return defaults
    
    @api.model_create_multi
    def create(self, vals_list):
        # Pour chaque enregistrement à créer
        for vals in vals_list:
            # Si c'est une facture ou un avoir client
            move_type = vals.get('move_type')
            
            # S'assurer que is_comptant est défini à True s'il n'est pas spécifié
            if 'is_comptant' not in vals:
                vals['is_comptant'] = True
                
            is_comptant = vals.get('is_comptant', True)
            
            if move_type in ('out_invoice', 'out_refund') and is_comptant:
                today = date.today()
                
                # Définir la date de facture à aujourd'hui si non spécifiée
                if not vals.get('invoice_date'):
                    vals['invoice_date'] = today
                
                # Définir la date d'échéance à aujourd'hui si non spécifiée
                if not vals.get('invoice_date_due'):
                    vals['invoice_date_due'] = today
        
        # Création normale via la méthode parent
        moves = super(AccountMove, self).create(vals_list)
        
        # Ne plus attribuer le numéro d'ordre à la création
        # Il sera attribué lors de la validation (post)
        
        return moves
    
    def write(self, vals):
        # Si on change le statut "comptant"
        if 'is_comptant' in vals:
            is_comptant = vals['is_comptant']
            
            # Si on passe à comptant, on met à jour les dates si nécessaire
            if is_comptant:
                today = date.today()
                for move in self:
                    if move.move_type in ('out_invoice', 'out_refund') and move.state == 'draft':
                        # Mise à jour des dates uniquement pour les brouillons
                        update_vals = {}
                        
                        if not move.invoice_date:
                            update_vals['invoice_date'] = today
                        
                        if not move.invoice_date_due:
                            update_vals['invoice_date_due'] = today
                        
                        # Si des mises à jour sont nécessaires, on les applique
                        if update_vals:
                            move.write(update_vals)
            
            # Appel au parent - ne plus recalculer le numéro d'ordre ici
            # Il sera généré uniquement lors de la validation
            return super(AccountMove, self).write(vals)
        
        return super(AccountMove, self).write(vals)
    
    @api.onchange('is_comptant')
    def _onchange_is_comptant(self):
        """Mettre à jour les dates lorsque l'utilisateur change manuellement le statut comptant"""
        if self.is_comptant and self.move_type in ('out_invoice', 'out_refund') and self.state == 'draft':
            today = date.today()
            
            # Mise à jour des dates uniquement si la facture est en brouillon
            if not self.invoice_date:
                self.invoice_date = today
            
            if not self.invoice_date_due:
                self.invoice_date_due = today
    
    # Ajouter une méthode onchange qui s'exécute à l'ouverture du formulaire
    @api.onchange('move_type')
    def _onchange_move_type_for_defaults(self):
        """Définir les valeurs par défaut lors de la création d'une nouvelle facture/avoir"""
        if self.move_type in ('out_invoice', 'out_refund') and self._origin.id is False:  # Nouveau document
            if not self.is_comptant:
                self.is_comptant = True
                
            today = date.today()
            
            if not self.invoice_date:
                self.invoice_date = today
                
            if not self.invoice_date_due:
                self.invoice_date_due = today
    
    def action_post(self):
        """Surcharge de la méthode de validation pour générer le numéro d'ordre"""
        # Générer le numéro d'ordre avant la validation pour les factures/avoirs clients
        for move in self:
            if (move.move_type in ('out_invoice', 'out_refund') and 
                move.state == 'draft' and not move.numero_ordre):
                move._compute_numero_ordre()
        
        # Appeler la méthode parent pour valider la facture
        return super(AccountMove, self).action_post()
    
    def _compute_numero_ordre(self):
        """Génère le numéro d'ordre en fonction du type de facture/avoir et du statut comptant"""
        for move in self:
            if move.move_type in ('out_invoice', 'out_refund') and not move.numero_ordre:
                sequence_code = False
                
                # Déterminer quelle séquence utiliser en fonction du type et du statut comptant
                if move.move_type == 'out_invoice':  # Facture client
                    if move.is_comptant:
                        sequence_code = 'facture.comptant.sequence'
                    else:
                        sequence_code = 'facture.normale.sequence'
                elif move.move_type == 'out_refund':  # Avoir client
                    if move.is_comptant:
                        sequence_code = 'avoir.comptant.sequence'
                    else:
                        sequence_code = 'avoir.normale.sequence'
                
                if sequence_code:
                    move.numero_ordre = self.env['ir.sequence'].next_by_code(sequence_code)
