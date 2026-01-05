// Système de validation avancé pour les formulaires
document.addEventListener('DOMContentLoaded', function() {
    // Configuration de validation
    const validationConfig = {
        fullname: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
            message: 'Le nom doit contenir uniquement des lettres, espaces, apostrophes et tirets'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Veuillez entrer une adresse email valide'
        },
        phone: {
            required: true,
            pattern: /^(\+229|229)?[0-9]{8,9}$/,
            message: 'Veuillez entrer un numéro de téléphone valide (format: +229 XX XX XX XX)'
        },
        address: {
            required: true,
            minLength: 10,
            maxLength: 500,
            message: 'L\'adresse doit contenir au moins 10 caractères'
        },
        motivation: {
            required: true,
            minLength: 50,
            maxLength: 1000,
            message: 'La motivation doit contenir au moins 50 caractères'
        },
        'donor-name': {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
            message: 'Le nom doit contenir uniquement des lettres, espaces, apostrophes et tirets'
        },
        'donor-email': {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Veuillez entrer une adresse email valide'
        },
        'card-number': {
            required: true,
            pattern: /^[0-9\s]{13,19}$/,
            message: 'Veuillez entrer un numéro de carte valide (13-19 chiffres)'
        },
        'card-expiry': {
            required: true,
            pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
            message: 'Format invalide. Utilisez MM/AA'
        },
        'card-cvc': {
            required: true,
            pattern: /^[0-9]{3,4}$/,
            message: 'Le CVC doit contenir 3 ou 4 chiffres'
        },
        'card-name': {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
            message: 'Le nom doit contenir uniquement des lettres, espaces, apostrophes et tirets'
        },
        // Champs de contact
        name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
            message: 'Le nom doit contenir uniquement des lettres, espaces, apostrophes et tirets'
        },
        subject: {
            required: false,
            maxLength: 200,
            message: 'Le sujet ne doit pas dépasser 200 caractères'
        },
        message: {
            required: true,
            minLength: 20,
            maxLength: 2000,
            message: 'Le message doit contenir au moins 20 caractères'
        }
    };

    // Fonction de validation principale
    function validateField(fieldId, value) {
        const config = validationConfig[fieldId];
        if (!config) return { isValid: true };

        const errors = [];

        // Vérification du champ obligatoire
        if (config.required && (!value || value.trim() === '')) {
            errors.push('Ce champ est obligatoire');
            return { isValid: false, errors };
        }

        // Si le champ n'est pas obligatoire et est vide, on le considère comme valide
        if (!config.required && (!value || value.trim() === '')) {
            return { isValid: true, errors: [] };
        }

        // Vérification de la longueur minimale
        if (config.minLength && value.length < config.minLength) {
            errors.push(`Minimum ${config.minLength} caractères requis`);
        }

        // Vérification de la longueur maximale
        if (config.maxLength && value.length > config.maxLength) {
            errors.push(`Maximum ${config.maxLength} caractères autorisés`);
        }

        // Vérification du pattern
        if (config.pattern && !config.pattern.test(value)) {
            errors.push(config.message);
        }

        // Validation spéciale pour la date d'expiration
        if (fieldId === 'card-expiry' && value) {
            const [month, year] = value.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (parseInt(month) < 1 || parseInt(month) > 12) {
                errors.push('Le mois doit être entre 01 et 12');
            }
            
            if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                errors.push('La carte a expiré');
            }
        }

        // Validation spéciale pour le numéro de téléphone
        if (fieldId === 'phone' && value) {
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            if (!/^(\+229|229)?[0-9]{8,9}$/.test(cleanPhone)) {
                errors.push('Format invalide. Utilisez +229 XX XX XX XX');
            }
        }

        // Validation spéciale pour le numéro de carte
        if (fieldId === 'card-number' && value) {
            const cleanCardNumber = value.replace(/\s/g, '');
            if (!validateCardNumber(cleanCardNumber)) {
                errors.push('Numéro de carte invalide');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validation du numéro de carte avec l'algorithme de Luhn
    function validateCardNumber(cardNumber) {
        const digits = cardNumber.replace(/\D/g, '').split('').map(Number);
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Fonction pour afficher les erreurs
    function showFieldError(field, errors) {
        // Supprimer les anciens messages d'erreur
        clearFieldError(field);
        
        // Ajouter la classe d'erreur au champ
        field.classList.add('error');
        field.classList.remove('valid');
        
        // Créer le message d'erreur
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-error';
        
        if (errors.length === 1) {
            errorContainer.textContent = errors[0];
        } else {
            const errorList = document.createElement('ul');
            errorList.style.margin = '0';
            errorList.style.paddingLeft = '20px';
            errors.forEach(error => {
                const li = document.createElement('li');
                li.textContent = error;
                errorList.appendChild(li);
            });
            errorContainer.appendChild(errorList);
        }
        
        // Insérer le message d'erreur après le champ
        field.parentNode.insertBefore(errorContainer, field.nextSibling);
    }

    // Fonction pour afficher le succès
    function showFieldSuccess(field) {
        // Supprimer les anciens messages
        clearFieldError(field);
        
        // Ajouter la classe de succès
        field.classList.add('valid');
        field.classList.remove('error');
        
        // Créer le message de succès
        const successContainer = document.createElement('div');
        successContainer.className = 'field-success';
        successContainer.textContent = 'Champ valide';
        
        // Insérer le message de succès après le champ
        field.parentNode.insertBefore(successContainer, field.nextSibling);
    }

    // Fonction pour supprimer les messages d'erreur/succès
    function clearFieldError(field) {
        field.classList.remove('error', 'valid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        const existingSuccess = field.parentNode.querySelector('.field-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
    }

    // Fonction pour valider un formulaire complet
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isFormValid = true;

        fields.forEach(field => {
            const fieldId = field.id || field.name;
            const value = field.value.trim();
            const validation = validateField(fieldId, value);

            if (!validation.isValid) {
                showFieldError(field, validation.errors);
                isFormValid = false;
            } else if (value) {
                showFieldSuccess(field);
            } else {
                clearFieldError(field);
            }
        });

        return isFormValid;
    }

    // Fonction pour créer un indicateur de progression
    function createProgressIndicator(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'form-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">0% complété</div>
        `;

        form.insertBefore(progressContainer, form.firstChild);
        return progressContainer;
    }

    // Fonction pour mettre à jour la progression
    function updateProgress(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
        const filledFields = Array.from(requiredFields).filter(field => field.value.trim() !== '');
        const progress = (filledFields.length / requiredFields.length) * 100;

        const progressFill = form.querySelector('.progress-fill');
        const progressText = form.querySelector('.progress-text');

        if (progressFill && progressText) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% complété`;
        }
    }

    // Validation en temps réel
    function setupRealTimeValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
            
            requiredFields.forEach(field => {
                // Validation lors de la perte de focus
                field.addEventListener('blur', function() {
                    const fieldId = this.id || this.name;
                    const value = this.value.trim();
                    const validation = validateField(fieldId, value);

                    if (!validation.isValid) {
                        showFieldError(this, validation.errors);
                    } else if (value) {
                        showFieldSuccess(this);
                    } else {
                        clearFieldError(this);
                    }
                });

                // Validation lors de la saisie (avec délai)
                let timeout;
                field.addEventListener('input', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const fieldId = this.id || this.name;
                        const value = this.value.trim();
                        
                        // Ne pas valider si le champ est vide
                        if (!value) {
                            clearFieldError(this);
                            return;
                        }

                        const validation = validateField(fieldId, value);
                        
                        if (!validation.isValid) {
                            showFieldError(this, validation.errors);
                        } else {
                            showFieldSuccess(this);
                        }
                    }, 500);
                });

                // Mise à jour de la progression
                field.addEventListener('input', function() {
                    const formId = this.closest('form').id;
                    if (formId) {
                        updateProgress(formId);
                    }
                });
            });
        });
    }

    // Validation des formulaires à la soumission
    function setupFormSubmissionValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const formId = this.id;
                const isValid = validateForm(formId);
                
                if (!isValid) {
                    e.preventDefault();
                    
                    // Faire défiler vers le premier champ en erreur
                    const firstError = this.querySelector('.form-control.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                    
                    // Afficher une notification
                    showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
                }
            });
        });
    }

    // Fonction de notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Formatage automatique des champs
    function setupFieldFormatting() {
        // Formatage du téléphone
        const phoneFields = document.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            field.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.startsWith('229')) {
                    value = '+229 ' + value.substring(3);
                } else if (value.startsWith('+229')) {
                    value = '+229 ' + value.substring(4);
                } else if (value.length > 0) {
                    value = '+229 ' + value;
                }
                
                if (value.length > 4) {
                    value = value.replace(/(\+229\s)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1$2 $3 $4 $5');
                }
                
                this.value = value;
            });
        });

        // Formatage du numéro de carte
        const cardFields = document.querySelectorAll('input[name="card-number"]');
        cardFields.forEach(field => {
            field.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                this.value = value;
            });
        });

        // Formatage de la date d'expiration
        const expiryFields = document.querySelectorAll('input[name="card-expiry"]');
        expiryFields.forEach(field => {
            field.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                this.value = value;
            });
        });
    }

    // Initialisation
    setupRealTimeValidation();
    setupFormSubmissionValidation();
    setupFieldFormatting();

    // Créer les indicateurs de progression pour les formulaires
    createProgressIndicator('join-form');
    createProgressIndicator('donation-form');
});
