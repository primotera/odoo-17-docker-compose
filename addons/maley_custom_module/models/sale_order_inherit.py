from odoo import models, fields

class SaleOrderInherit(models.Model):
    _inherit = 'sale.order'

    # Add your custom fields or methods here
    ref_commande = fields.Char(string='Référence de la commande')