
{
    "name": "Pneu Maley Custom Module",
    "version": "17.0.1.0.0",
    "category": "Tools",
    "summary": """""",
    "description": """""",
    'author': 'KHK',
    'company': 'KHK',
    'maintainer': 'KHK',
    'website': "",
    "depends": ['stock', 'sale_management'],
    "data": [
        'security/ir.model.access.csv',
        'views/res_mark_views.xml',
        'views/product_template_inherit.xml',
        'views/sale_order_inherit.xml',
        #'report/account_move.xml',
    ],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
