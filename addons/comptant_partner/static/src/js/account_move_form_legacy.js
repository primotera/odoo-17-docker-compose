odoo.define('comptant_partner.account_move_form', function (require) {
    "use strict";

    var FormRenderer = require('web.FormRenderer');
    var core = require('web.core');

    FormRenderer.include({
        /**
         * Surcharge pour ajouter la logique après le rendu du formulaire
         */
        _renderView: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function (result) {
                if (self.state && self.state.model === 'account.move') {
                    self._setupComptantHandler();
                }
                return result;
            });
        },

        /**
         * Configure un gestionnaire d'événements sur le champ is_comptant
         */
        _setupComptantHandler: function () {
            var self = this;
            
            // Attendre que le DOM soit complètement rendu
            setTimeout(function() {
                var $comptantField = self.$('input[name="is_comptant"]');
                
                if ($comptantField.length && !$comptantField.data('listener-added')) {
                    $comptantField.on('change.comptant', function (event) {
                        var isComptant = $(this).prop('checked');
                        
                        if (isComptant) {
                            var moveType = self.state.data.move_type;
                            var state = self.state.data.state;
                            
                            // Vérifier si c'est une facture/avoir client en brouillon
                            if (['out_invoice', 'out_refund'].includes(moveType) && state === 'draft') {
                                var today = new Date().toISOString().split('T')[0];
                                
                                // Mettre à jour la date de facture si vide
                                var $invoiceDateField = self.$('input[name="invoice_date"]');
                                if ($invoiceDateField.length && !$invoiceDateField.val()) {
                                    $invoiceDateField.val(today).trigger('change');
                                }
                                
                                // Mettre à jour la date d'échéance si vide
                                var $invoiceDateDueField = self.$('input[name="invoice_date_due"]');
                                if ($invoiceDateDueField.length && !$invoiceDateDueField.val()) {
                                    $invoiceDateDueField.val(today).trigger('change');
                                }
                            }
                        }
                    });
                    
                    $comptantField.data('listener-added', true);
                }
            }, 100);
        },

        /**
         * Nettoyage des événements lors de la destruction
         */
        destroy: function () {
            if (this.$) {
                this.$('input[name="is_comptant"]').off('change.comptant');
            }
            this._super.apply(this, arguments);
        }
    });
});