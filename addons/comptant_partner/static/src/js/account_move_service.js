/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useEffect } from "@odoo/owl";

const accountMoveFormService = {
    dependencies: [],
    start() {
        // Service pour gérer la logique comptant sur les formulaires account.move
        return {
            setupComptantHandler(component) {
                if (component.props.resModel === 'account.move') {
                    useEffect(() => {
                        const el = component.el;
                        if (!el) return;

                        const comptantField = el.querySelector('input[name="is_comptant"]');
                        if (comptantField && !comptantField.hasAttribute('data-listener-added')) {
                            const handleChange = (event) => {
                                const isComptant = event.target.checked;
                                
                                if (isComptant) {
                                    const record = component.props.record;
                                    const moveType = record.data.move_type;
                                    const state = record.data.state;
                                    
                                    // Vérifier si c'est une facture/avoir client en brouillon
                                    if (['out_invoice', 'out_refund'].includes(moveType) && state === 'draft') {
                                        const today = new Date().toISOString().split('T')[0];
                                        
                                        // Mettre à jour la date de facture si vide
                                        const invoiceDateField = el.querySelector('input[name="invoice_date"]');
                                        if (invoiceDateField && !invoiceDateField.value) {
                                            invoiceDateField.value = today;
                                            invoiceDateField.dispatchEvent(new Event('input', { bubbles: true }));
                                            invoiceDateField.dispatchEvent(new Event('change', { bubbles: true }));
                                        }
                                        
                                        // Mettre à jour la date d'échéance si vide
                                        const invoiceDateDueField = el.querySelector('input[name="invoice_date_due"]');
                                        if (invoiceDateDueField && !invoiceDateDueField.value) {
                                            invoiceDateDueField.value = today;
                                            invoiceDateDueField.dispatchEvent(new Event('input', { bubbles: true }));
                                            invoiceDateDueField.dispatchEvent(new Event('change', { bubbles: true }));
                                        }
                                    }
                                }
                            };

                            comptantField.addEventListener('change', handleChange);
                            comptantField.setAttribute('data-listener-added', 'true');

                            return () => {
                                comptantField.removeEventListener('change', handleChange);
                            };
                        }
                    });
                }
            }
        };
    }
};

registry.category("services").add("account_move_form_comptant", accountMoveFormService);