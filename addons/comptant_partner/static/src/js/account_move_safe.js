// Version ultra-défensive pour gérer le champ is_comptant
(function() {
    'use strict';
    
    let observer = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    
    // Fonction pour configurer les écouteurs d'événements
    function setupComptantHandlers() {
        try {
            // Sélectionner tous les champs is_comptant sur la page
            const comptantFields = document.querySelectorAll('input[name="is_comptant"]');
            
            comptantFields.forEach(function(field) {
                // Éviter d'ajouter plusieurs écouteurs sur le même champ
                if (field.getAttribute('data-comptant-handler') === 'true') {
                    return;
                }
                
                field.setAttribute('data-comptant-handler', 'true');
                
                field.addEventListener('change', function(event) {
                    try {
                        const isComptant = event.target.checked;
                        
                        if (isComptant) {
                            // Trouver le formulaire parent
                            const form = event.target.closest('form') || 
                                        event.target.closest('.o_form_view') ||
                                        event.target.closest('.o_content');
                            
                            if (form) {
                                // Chercher les champs de type de mouvement et d'état
                                const moveTypeField = form.querySelector('select[name="move_type"], input[name="move_type"]');
                                const stateField = form.querySelector('select[name="state"], input[name="state"]');
                                
                                if (moveTypeField && stateField) {
                                    const moveType = moveTypeField.value;
                                    const state = stateField.value;
                                    
                                    // Vérifier si c'est une facture/avoir client en brouillon
                                    if (['out_invoice', 'out_refund'].includes(moveType) && 
                                        (state === 'draft' || state === '' || !state)) {
                                        
                                        const today = new Date().toISOString().split('T')[0];
                                        
                                        // Mettre à jour la date de facture si vide
                                        const invoiceDateField = form.querySelector('input[name="invoice_date"]');
                                        if (invoiceDateField && !invoiceDateField.value) {
                                            invoiceDateField.value = today;
                                            // Déclencher les événements pour notifier Odoo du changement
                                            ['input', 'change', 'blur'].forEach(eventType => {
                                                try {
                                                    invoiceDateField.dispatchEvent(new Event(eventType, { bubbles: true }));
                                                } catch (e) {
                                                    console.log('Event dispatch error:', e);
                                                }
                                            });
                                        }
                                        
                                        // Mettre à jour la date d'échéance si vide
                                        const invoiceDateDueField = form.querySelector('input[name="invoice_date_due"]');
                                        if (invoiceDateDueField && !invoiceDateDueField.value) {
                                            invoiceDateDueField.value = today;
                                            // Déclencher les événements pour notifier Odoo du changement
                                            ['input', 'change', 'blur'].forEach(eventType => {
                                                try {
                                                    invoiceDateDueField.dispatchEvent(new Event(eventType, { bubbles: true }));
                                                } catch (e) {
                                                    console.log('Event dispatch error:', e);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Erreur dans le gestionnaire de comptant:', error);
                    }
                });
            });
        } catch (error) {
            console.error('Erreur lors de la configuration des gestionnaires:', error);
        }
    }
    
    // Fonction pour configurer l'observer du DOM
    function setupObserver() {
        try {
            // Vérifier que tous les éléments nécessaires existent
            if (!document || !document.body || typeof MutationObserver === 'undefined') {
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    setTimeout(setupObserver, 100 * retryCount);
                }
                return;
            }
            
            // Nettoyer l'observer précédent s'il existe
            if (observer) {
                try {
                    observer.disconnect();
                } catch (e) {
                    console.log('Observer disconnect error:', e);
                }
            }
            
            observer = new MutationObserver(function(mutations) {
                try {
                    let shouldSetup = false;
                    
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes) {
                            mutation.addedNodes.forEach(function(node) {
                                if (node && node.nodeType === 1) { // ELEMENT_NODE
                                    // Vérifier si un nouveau champ comptant a été ajouté
                                    if (node.querySelector && 
                                        typeof node.querySelector === 'function') {
                                        try {
                                            if (node.querySelector('input[name="is_comptant"]')) {
                                                shouldSetup = true;
                                            }
                                        } catch (e) {
                                            // Ignorer les erreurs de querySelector
                                        }
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
                        setTimeout(setupComptantHandlers, 200);
                    }
                } catch (error) {
                    console.error('Erreur dans MutationObserver:', error);
                }
            });
            
            // Observer les changements dans le body
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
        } catch (error) {
            console.error('Erreur lors de la configuration de l\'observer:', error);
        }
    }
    
    // Fonction d'initialisation principale
    function init() {
        try {
            setupComptantHandlers();
            setupObserver();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }
    
    // Fonction de démarrage avec plusieurs tentatives
    function start() {
        if (document && (document.readyState === 'interactive' || document.readyState === 'complete')) {
            setTimeout(init, 500);
        } else if (document) {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(init, 500);
            });
        }
        
        // Tentative supplémentaire après le chargement complet
        if (window) {
            window.addEventListener('load', function() {
                setTimeout(init, 1000);
            });
        }
        
        // Dernière tentative avec un délai plus long
        setTimeout(init, 2000);
    }
    
    // Démarrer le script
    start();
    
})();