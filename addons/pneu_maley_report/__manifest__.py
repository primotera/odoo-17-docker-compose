
{
    "name": "Pneu Maley Repoort",
    "version": "17.0.1.0.0",
    "category": "Tools",
    "summary": """This app helps to interact with odoo, backend with help of 
     rest api requests""",
    "description": """Custom report""",
    'author': 'Cybrosys Techno Solutions',
    'company': 'Cybrosys Techno Solutions',
    'maintainer': 'Cybrosys Techno Solutions',
    'website': "https://www.cybrosys.com",
    "depends": ['base', 'account'],
    "data": [
        #'security/ir.model.access.csv',
        #'views/res_users_views.xml',
        #'views/connection_api_views.xml',
        'report/account_move.xml',
        'report/stock_picking_report_inherit.xml',
    ],
    'images': ['static/description/banner.jpg'],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
