# -*- coding: utf-8 -*-
from odoo import fields, models

class ResMark(models.Model):
    _name = "res.mark"
    _sql_constraints = [('mark_name_unique', 'unique(name)', "Le nom d'une marque doit être unique!")]

    name = fields.Char('Name', required=True)