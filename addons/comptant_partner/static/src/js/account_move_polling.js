// Version avec polling simple pour éviter les MutationObserver
(function() {
    'use strict';
    
    let checkInterval = null;
    
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
                                            invoiceDateField.dispatchEvent(new Event('input', { bubbles: true }));
                                            invoiceDateField.dispatchEvent(new Event('change', { bubbles: true }));
                                        }
                                        
                                        // Mettre à jour la date d'échéance si vide
                                        const invoiceDateDueField = form.querySelector('input[name="invoice_date_due"]');
                                        if (invoiceDateDueField && !invoiceDateDueField.value) {
                                            invoiceDateDueField.value = today;
                                            invoiceDateDueField.dispatchEvent(new Event('input', { bubbles: true }));
                                            invoiceDateDueField.dispatchEvent(new Event('change', { bubbles: true }));
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
    
    // Fonction de vérification périodique
    function periodicCheck() {
        setupComptantHandlers();
    }
    
    // Fonction d'initialisation
    function init() {
        try {
            // Configuration initiale
            setupComptantHandlers();
            
            // Vérification périodique toutes les 2 secondes pour détecter de nouveaux champs
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            checkInterval = setInterval(periodicCheck, 2000);
            
            // Nettoyer l'interval après 30 secondes pour éviter les fuites mémoire
            setTimeout(function() {
                if (checkInterval) {
                    clearInterval(checkInterval);
                    checkInterval = null;
                }
            }, 30000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }
    
    // Démarrage différé pour s'assurer que tout est chargé
    setTimeout(function() {
        if (document && document.body) {
            init();
        } else {
            // Retry après un délai plus long
            setTimeout(function() {
                if (document && document.body) {
                    init();
                }
            }, 2000);
        }
    }, 1000);
    
})();