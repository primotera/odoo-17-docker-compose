# -*- coding: utf-8 -*-
from odoo import fields, models

class ProductTemplateInherit(models.Model):
    _inherit = "product.template"

    mark_id = fields.Many2one('res.mark', string="Marque")