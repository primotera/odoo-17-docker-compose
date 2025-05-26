{
    'name': 'Gestion Factures Comptant',
    'version': '1.0',
    'summary': 'Gestion des factures ou avoirs comptant',
    'description': """
        Ce module permet de gérer les factures ou avoirs comptant avec un numéro d'ordre spécifique.
        Il ajoute:
        - Un champ booléen 'is_comptant' pour indiquer si la facture est comptant ou non
        - Un champ 'numero_ordre' qui s'auto-incrémente en fonction du type de facture (comptant ou non)
    """,
    'category': 'Accounting',
    'author': 'Votre Entreprise',
    'website': 'https://www.votreentreprise.com',
    'depends': ['account'],
    'data': [
        'views/account_move_views.xml',
        'data/ir_sequence_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'comptant_partner/static/src/js/account_move_polling.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}