/** @odoo-module **/

import { FormRenderer } from "@web/views/form/form_renderer";
import { patch } from "@web/core/utils/patch";

patch(FormRenderer.prototype, {
    /**
     * Surcharge de la méthode setup pour ajouter un gestionnaire d'événements après le rendu
     */
    setup() {
        super.setup(...arguments);
        this.setupComptantHandler();
    },

    /**
     * Configure un gestionnaire d'événements sur le champ is_comptant
     */
    setupComptantHandler() {
        if (this.props.record && this.props.record.resModel === 'account.move') {
            // Utiliser une mutation observer pour détecter quand le DOM est prêt
            const observer = new MutationObserver((mutations) => {
                const comptantField = this.el?.querySelector('input[name="is_comptant"]');
                if (comptantField && !comptantField.hasAttribute('data-listener-added')) {
                    this._addComptantListener(comptantField);
                    comptantField.setAttribute('data-listener-added', 'true');
                }
            });

            if (this.el) {
                observer.observe(this.el, { childList: true, subtree: true });
                
                // Nettoyer l'observer après un délai raisonnable
                setTimeout(() => observer.disconnect(), 2000);
            }
        }
    },

    /**
     * Ajoute l'écouteur d'événement sur le champ is_comptant
     */
    _addComptantListener(comptantField) {
        comptantField.addEventListener('change', (event) => {
            const isComptant = event.target.checked;
            
            if (isComptant) {
                const record = this.props.record;
                const moveType = record.data.move_type;
                const state = record.data.state;
                
                // Vérifier si c'est une facture/avoir client en brouillon
                if (['out_invoice', 'out_refund'].includes(moveType) && state === 'draft') {
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Mettre à jour la date de facture si vide
                    const invoiceDateField = this.el?.querySelector('input[name="invoice_date"]');
                    if (invoiceDateField && !invoiceDateField.value) {
                        invoiceDateField.value = today;
                        invoiceDateField.dispatchEvent(new Event('input', { bubbles: true }));
                        invoiceDateField.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    // Mettre à jour la date d'échéance si vide
                    const invoiceDateDueField = this.el?.querySelector('input[name="invoice_date_due"]');
                    if (invoiceDateDueField && !invoiceDateDueField.value) {
                        invoiceDateDueField.value = today;
                        invoiceDateDueField.dispatchEvent(new Event('input', { bubbles: true }));
                        invoiceDateDueField.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        });
    },
});