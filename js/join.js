// ===== JOIN PAGE JAVASCRIPT =====

// Initialize join page
document.addEventListener('DOMContentLoaded', function() {
    initJoinModals();
    initDonationForm();
    initJoinForm();
});

// Join modal functionality
function initJoinModals() {
    const joinModal = document.getElementById('join-modal');
    const donationModal = document.getElementById('donation-modal');
    
    // Close modals
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close on background click
    [joinModal, donationModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                openModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
}

// Show join form modal
function showJoinForm(type) {
    const modal = document.getElementById('join-modal');
    const title = document.getElementById('join-modal-title');
    const form = document.getElementById('join-form');
    
    // Update title based on type
    const titles = {
        'member': 'Adhérer à OED',
        'volunteer': 'Devenir bénévole',
        'partner': 'Devenir partenaire'
    };
    
    title.textContent = titles[type] || 'Rejoindre OED';
    
    // Add hidden field for type
    let typeField = form.querySelector('input[name="join-type"]');
    if (!typeField) {
        typeField = document.createElement('input');
        typeField.type = 'hidden';
        typeField.name = 'join-type';
        form.appendChild(typeField);
    }
    typeField.value = type;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Show donation form modal
function showDonationForm() {
    const modal = document.getElementById('donation-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Initialize join form
function initJoinForm() {
    const form = document.getElementById('join-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Validate form
        if (validateJoinForm(formObject)) {
            submitJoinForm(formObject);
        }
    });
}

// Initialize donation form
function initDonationForm() {
    const form = document.getElementById('donation-form');
    const amountButtons = form.querySelectorAll('.amount-btn');
    const customAmount = form.querySelector('#custom-amount');
    
    // Amount button selection
    amountButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            amountButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Clear custom amount
            customAmount.value = '';
        });
    });
    
    // Custom amount input
    customAmount.addEventListener('input', function() {
        amountButtons.forEach(btn => btn.classList.remove('active'));
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Get selected amount
        const selectedButton = form.querySelector('.amount-btn.active');
        const amount = selectedButton ? selectedButton.dataset.amount : customAmount.value;
        
        if (amount && amount > 0) {
            formObject.amount = amount;
            processDonation(formObject);
        } else {
            showNotification('Veuillez sélectionner un montant valide', 'error');
        }
    });
}

// Validate join form
function validateJoinForm(data) {
    let isValid = true;
    const errors = {};
    
    // Required fields
    const requiredFields = ['fullname', 'email', 'phone', 'address', 'motivation'];
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim().length === 0) {
            errors[field] = 'Ce champ est requis';
            isValid = false;
        }
    });
    
    // Email validation
    if (data.email && !validateEmail(data.email)) {
        errors.email = 'Veuillez entrer une adresse email valide';
        isValid = false;
    }
    
    // Phone validation
    if (data.phone && !validatePhone(data.phone)) {
        errors.phone = 'Veuillez entrer un numéro de téléphone valide';
        isValid = false;
    }
    
    // Age validation
    if (data.age && (data.age < 18 || data.age > 100)) {
        errors.age = 'L\'âge doit être entre 18 et 100 ans';
        isValid = false;
    }
    
    // Motivation length
    if (data.motivation && data.motivation.trim().length < 50) {
        errors.motivation = 'La motivation doit contenir au moins 50 caractères';
        isValid = false;
    }
    
    // Privacy checkbox
    if (!data.privacy) {
        errors.privacy = 'Vous devez accepter la politique de confidentialité';
        isValid = false;
    }
    
    // Display errors
    if (!isValid) {
        displayFormErrors(errors);
    }
    
    return isValid;
}

// Submit join form
function submitJoinForm(data) {
    const submitBtn = document.querySelector('#join-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Envoi en cours...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual AJAX call)
    setTimeout(() => {
        showNotification('Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
        
        // Close modal
        const modal = document.getElementById('join-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('join-form').reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 3000);
}

// Process donation
function processDonation(data) {
    const submitBtn = document.querySelector('#donation-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Traitement...';
    submitBtn.disabled = true;
    
    // Simulate donation processing (replace with actual payment gateway integration)
    setTimeout(() => {
        showNotification(`Merci pour votre don de ${data.amount} FCFA !`, 'success');
        
        // Close modal
        const modal = document.getElementById('donation-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        document.getElementById('donation-form').reset();
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Here you would integrate with payment gateways like:
        // - Flutterwave
        // - Paystack
        // - Mobile Money (MTN, Moov, etc.)
        // - PayPal
        
    }, 2000);
}

// Display form errors
function displayFormErrors(errors) {
    // Clear previous errors
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
    
    // Remove error styling
    const errorFields = document.querySelectorAll('.form-control.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    // Display new errors
    Object.keys(errors).forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = errors[fieldName];
            
            field.parentNode.appendChild(errorDiv);
        }
    });
    
    // Remove error styling on input
    const errorFieldsNew = document.querySelectorAll('.form-control.error');
    errorFieldsNew.forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.form-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success {
                background: var(--success);
                color: white;
            }
            
            .notification-error {
                background: var(--danger);
                color: white;
            }
            
            .notification-info {
                background: var(--info);
                color: white;
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 1rem;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Export functions for global use
window.JoinApp = {
    showJoinForm,
    showDonationForm,
    validateEmail,
    validatePhone,
    showNotification
};
