// Simple JavaScript pour gérer le champ is_comptant
(function() {
    'use strict';
    
    let observer = null;
    
    // Fonction pour configurer les écouteurs d'événements
    function setupComptantHandlers() {
        // Sélectionner tous les champs is_comptant sur la page
        const comptantFields = document.querySelectorAll('input[name="is_comptant"]');
        
        comptantFields.forEach(function(field) {
            // Éviter d'ajouter plusieurs écouteurs sur le même champ
            if (field.getAttribute('data-comptant-handler') === 'true') {
                return;
            }
            
            field.setAttribute('data-comptant-handler', 'true');
            
            field.addEventListener('change', function(event) {
                const isComptant = event.target.checked;
                
                if (isComptant) {
                    // Trouver le formulaire parent
                    const form = event.target.closest('form') || event.target.closest('.o_form_view');
                    
                    if (form) {
                        // Chercher les champs de type de mouvement et d'état
                        const moveTypeField = form.querySelector('select[name="move_type"], input[name="move_type"]');
                        const stateField = form.querySelector('select[name="state"], input[name="state"]');
                        
                        if (moveTypeField && stateField) {
                            const moveType = moveTypeField.value;
                            const state = stateField.value;
                            
                            // Vérifier si c'est une facture/avoir client en brouillon
                            if (['out_invoice', 'out_refund'].includes(moveType) && 
                                (state === 'draft' || state === '')) {
                                
                                const today = new Date().toISOString().split('T')[0];
                                
                                // Mettre à jour la date de facture si vide
                                const invoiceDateField = form.querySelector('input[name="invoice_date"]');
                                if (invoiceDateField && !invoiceDateField.value) {
                                    invoiceDateField.value = today;
                                    // Déclencher les événements pour notifier Odoo du changement
                                    invoiceDateField.dispatchEvent(new Event('input', { bubbles: true }));
                                    invoiceDateField.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                                
                                // Mettre à jour la date d'échéance si vide
                                const invoiceDateDueField = form.querySelector('input[name="invoice_date_due"]');
                                if (invoiceDateDueField && !invoiceDateDueField.value) {
                                    invoiceDateDueField.value = today;
                                    // Déclencher les événements pour notifier Odoo du changement
                                    invoiceDateDueField.dispatchEvent(new Event('input', { bubbles: true }));
                                    invoiceDateDueField.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    
    // Fonction pour configurer l'observer du DOM
    function setupObserver() {
        // S'assurer que document.body existe
        if (!document.body) {
            setTimeout(setupObserver, 50);
            return;
        }
        
        // Nettoyer l'observer précédent s'il existe
        if (observer) {
            observer.disconnect();
        }
        
        observer = new MutationObserver(function(mutations) {
            let shouldSetup = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier si un nouveau champ comptant a été ajouté
                            if (node.querySelector && node.querySelector('input[name="is_comptant"]')) {
                                shouldSetup = true;
                            }
                            // Ou si le nœud lui-même est un champ comptant
                            if (node.tagName === 'INPUT' && node.name === 'is_comptant') {
                                shouldSetup = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldSetup) {
                // Petite attente pour s'assurer que le DOM est complètement construit
                setTimeout(setupComptantHandlers, 100);
            }
        });
        
        // Observer les changements dans le body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Fonction d'initialisation principale
    function init() {
        setupComptantHandlers();
        setupObserver();
    }
    
    // Configurer selon l'état du document
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        // Le DOM est déjà chargé, mais attendons un peu pour être sûr
        setTimeout(init, 100);
    }
    
    // Aussi écouter l'événement load au cas où
    window.addEventListener('load', function() {
        setTimeout(init, 200);
    });
    
})();