// ===== CONTACT PAGE JAVASCRIPT =====

// Initialize contact page
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQ();
    initMap();
    initSocialCards();
});

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const formObject = {};
            
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Validate form
            if (validateContactForm(formObject)) {
                submitContactForm(formObject);
            }
        });
    }
}

// Validate contact form
function validateContactForm(data) {
    let isValid = true;
    const errors = {};
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères.';
        isValid = false;
    }
    
    // Email validation
    if (!data.email || !validateEmail(data.email)) {
        errors.email = 'Veuillez entrer une adresse email valide.';
        isValid = false;
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (data.phone && !validatePhone(data.phone)) {
        errors.phone = 'Veuillez entrer un numéro de téléphone valide.';
        isValid = false;
    }
    
    // Message validation
    if (!data.message || data.message.trim().length < 10) {
        errors.message = 'Le message doit contenir au moins 10 caractères.';
        isValid = false;
    }
    
    // Display errors
    if (!isValid) {
        displayFormErrors(errors);
    }
    
    return isValid;
}

// Submit contact form
function submitContactForm(data) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Envoi en cours...';
    submitBtn.disabled = true;
    
    // Submit form via AJAX
    fetch('php/contact.php', {
        method: 'POST',
        body: new FormData(contactForm)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
            contactForm.reset();
        } else {
            showNotification(result.message || 'Erreur lors de l\'envoi du message.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
    })
    .finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const answer = item.querySelector('.faq-answer');
            const icon = question.querySelector('i');
            
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    
                    otherAnswer.style.display = 'none';
                    otherIcon.style.transform = 'rotate(0deg)';
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
                item.classList.remove('active');
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
                item.classList.add('active');
            }
        });
    });
}

// Initialize map
function initMap() {
    const mapContainer = document.getElementById('map');
    
    if (mapContainer) {
        // Coordinates for Djougou, Benin
        const djougouCoords = { lat: 9.7081, lng: 1.6660 };
        
        // Create map (this would use Google Maps API in production)
        createMapPlaceholder(mapContainer, djougouCoords);
    }
}

// Create map placeholder (replace with actual Google Maps implementation)
function createMapPlaceholder(container, coords) {
    const placeholder = container.querySelector('.map-placeholder');
    
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="map-marker">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="map-info">
                <h4>OASIS ÉDUCATION ET DÉVELOPPEMENT</h4>
                <p>Djougou, Donga, Bénin</p>
                <small>Coordonnées: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}</small>
            </div>
        `;
        
        // Add click handler to open in Google Maps
        container.addEventListener('click', function() {
            const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
            window.open(googleMapsUrl, '_blank');
        });
        
        container.style.cursor = 'pointer';
    }
}

// Initialize social cards
function initSocialCards() {
    const socialCards = document.querySelectorAll('.social-card');
    
    socialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
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
window.ContactApp = {
    validateEmail,
    validatePhone,
    showNotification
};
