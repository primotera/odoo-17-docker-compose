odoo.define('comptant_partner.account_move_form', function (require) {
    "use strict";

    var core = require('web.core');
    var _t = core._t;
    var FormRenderer = require('web.FormRenderer');
    
    /**
     * Extension du renderer du formulaire pour gérer les événements sur le champ is_comptant
     */
    FormRenderer.include({
        /**
         * Surcharge de la méthode _renderView pour ajouter un gestionnaire d'événements après le rendu
         */
        _renderView: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                // Pour ne s'appliquer qu'aux formulaires account.move
                if (self.state && self.state.model === 'account.move') {
                    self._setupComptantHandler();
                }
                return Promise.resolve();
            });
        },
        
        /**
         * Configure un gestionnaire d'événements sur le champ is_comptant
         */
        _setupComptantHandler: function () {
            var self = this;
            
            // Sélectionner le champ is_comptant dans le DOM
            this.$el.find('input[name="is_comptant"]').on('change', function (event) {
                var isComptant = $(this).prop('checked');
                
                // Si le champ passe à True (coché)
                if (isComptant) {
                    var state = self.$el.find('select[name="state"]').val() || 
                               self.$el.find('input[name="state"]').val();
                    var moveType = self.$el.find('select[name="move_type"]').val() || 
                                  self.$el.find('input[name="move_type"]').val();
                    
                    // Vérifier si c'est une facture/avoir client en brouillon
                    if (['out_invoice', 'out_refund'].includes(moveType) && state === 'draft') {
                        var today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
                        
                        // Récupérer les valeurs actuelles des dates
                        var invoiceDate = self.$el.find('input[name="invoice_date"]').val();
                        var invoiceDateDue = self.$el.find('input[name="invoice_date_due"]').val();
                        
                        // Mettre à jour la date de facture si vide
                        if (!invoiceDate) {
                            self.$el.find('input[name="invoice_date"]').val(today).trigger('change');
                        }
                        
                        // Mettre à jour la date d'échéance si vide
                        if (!invoiceDateDue) {
                            self.$el.find('input[name="invoice_date_due"]').val(today).trigger('change');
                        }
                    }
                }
            });
        },
    });
    
    return {
        FormRenderer: FormRenderer
    };
});