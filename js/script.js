// ===== OASIS EDUCATION ET DÉVELOPPEMENT - MAIN JAVASCRIPT FILE =====

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== INITIALIZE APPLICATION =====
function initializeApp() {
    initNavigation();
    initScrollEffects();
    initAnimations();
    initForms();
    initCounters();
    initImageLazyLoading();
    initNewsletter();
    initContactForm();
}

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Active navigation link highlighting
    updateActiveNavLink();
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .stat-item, .mission-point, .card');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== FORM FUNCTIONALITY =====
function initForms() {
    // Contact form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterForm);
    }

    // Join form
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinForm);
    }
}

// ===== CONTACT FORM HANDLER =====
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formObject = {};
    
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Validate form
    if (validateContactForm(formObject)) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Envoi en cours...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual AJAX call)
        setTimeout(() => {
            showNotification('Message envoyé avec succès !', 'success');
            e.target.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}

// ===== CONTACT FORM VALIDATION =====
function validateContactForm(data) {
    let isValid = true;
    const errors = {};

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères';
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = 'Veuillez entrer une adresse email valide';
        isValid = false;
    }

    // Phone validation (optional but if provided, should be valid)
    if (data.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
        errors.phone = 'Veuillez entrer un numéro de téléphone valide';
        isValid = false;
    }

    // Message validation
    if (!data.message || data.message.trim().length < 10) {
        errors.message = 'Le message doit contenir au moins 10 caractères';
        isValid = false;
    }

    // Display errors
    displayFormErrors(errors);

    return isValid;
}

// ===== NEWSLETTER FORM HANDLER =====
function handleNewsletterForm(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (validateEmail(email)) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span>';
        
        // Simulate subscription (replace with actual AJAX call)
        setTimeout(() => {
            showNotification('Merci pour votre inscription à notre newsletter !', 'success');
            e.target.reset();
            submitBtn.innerHTML = originalHTML;
        }, 1500);
    } else {
        showNotification('Veuillez entrer une adresse email valide', 'error');
    }
}

// ===== JOIN FORM HANDLER =====
function handleJoinForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formObject = {};
    
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Validate form
    if (validateJoinForm(formObject)) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Traitement en cours...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual AJAX call)
        setTimeout(() => {
            showNotification('Votre candidature a été envoyée avec succès !', 'success');
            e.target.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 3000);
    }
}

// ===== JOIN FORM VALIDATION =====
function validateJoinForm(data) {
    let isValid = true;
    const errors = {};

    // Name validation
    if (!data.fullname || data.fullname.trim().length < 2) {
        errors.fullname = 'Le nom complet est requis';
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = 'Veuillez entrer une adresse email valide';
        isValid = false;
    }

    // Phone validation
    if (!data.phone || !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
        errors.phone = 'Veuillez entrer un numéro de téléphone valide';
        isValid = false;
    }

    // Address validation
    if (!data.address || data.address.trim().length < 10) {
        errors.address = 'L\'adresse doit contenir au moins 10 caractères';
        isValid = false;
    }

    // Motivation validation
    if (!data.motivation || data.motivation.trim().length < 50) {
        errors.motivation = 'La motivation doit contenir au moins 50 caractères';
        isValid = false;
    }

    // Display errors
    displayFormErrors(errors);

    return isValid;
}

// ===== FORM ERROR DISPLAY =====
function displayFormErrors(errors) {
    // Clear previous errors
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());

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
    const errorFields = document.querySelectorAll('.form-control.error');
    errorFields.forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.form-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

// ===== COUNTER ANIMATION =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ===== ANIMATE COUNTER =====
function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const suffix = element.textContent.replace(/\d/g, '');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// ===== IMAGE LAZY LOADING =====
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== NEWSLETTER INITIALIZATION =====
function initNewsletter() {
    // Newsletter form is already handled in initForms()
}

// ===== CONTACT FORM INITIALIZATION =====
function initContactForm() {
    // Contact form is already handled in initForms()
}

// ===== UTILITY FUNCTIONS =====

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

    // Add to page
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

// Update active navigation link
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ===== DONATION FUNCTIONALITY =====
function initDonation() {
    const donationButtons = document.querySelectorAll('.donate-btn');
    
    donationButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const amount = this.dataset.amount;
            const type = this.dataset.type || 'general';
            
            showDonationModal(amount, type);
        });
    });
}

// ===== DONATION MODAL =====
function showDonationModal(amount = '', type = 'general') {
    const modal = document.createElement('div');
    modal.className = 'modal donation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Faire un don</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Votre don nous aide à continuer nos actions pour l'éducation et le développement durable.</p>
                <div class="donation-amounts">
                    <button class="amount-btn" data-amount="5000">5 000 FCFA</button>
                    <button class="amount-btn" data-amount="10000">10 000 FCFA</button>
                    <button class="amount-btn" data-amount="25000">25 000 FCFA</button>
                    <button class="amount-btn" data-amount="50000">50 000 FCFA</button>
                </div>
                <div class="custom-amount">
                    <input type="number" id="custom-amount" placeholder="Montant personnalisé (FCFA)">
                </div>
                <div class="donation-type">
                    <label>
                        <input type="radio" name="donation-type" value="general" checked>
                        Don général
                    </label>
                    <label>
                        <input type="radio" name="donation-type" value="women">
                        Autonomisation des femmes
                    </label>
                    <label>
                        <input type="radio" name="donation-type" value="children">
                        Protection des enfants
                    </label>
                    <label>
                        <input type="radio" name="donation-type" value="environment">
                        Protection environnementale
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Annuler</button>
                <button class="btn btn-primary" id="proceed-donation">Procéder au don</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Set initial values
    if (amount) {
        const customAmount = modal.querySelector('#custom-amount');
        customAmount.value = amount;
    }

    const typeInput = modal.querySelector(`input[name="donation-type"][value="${type}"]`);
    if (typeInput) {
        typeInput.checked = true;
    }

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#proceed-donation').addEventListener('click', () => {
        const selectedAmount = modal.querySelector('.amount-btn.selected')?.dataset.amount || 
                             modal.querySelector('#custom-amount').value;
        const selectedType = modal.querySelector('input[name="donation-type"]:checked').value;

        if (selectedAmount && selectedAmount > 0) {
            processDonation(selectedAmount, selectedType);
            document.body.removeChild(modal);
        } else {
            showNotification('Veuillez sélectionner un montant valide', 'error');
        }
    });

    // Amount button selection
    modal.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            modal.querySelector('#custom-amount').value = '';
        });
    });

    // Custom amount input
    modal.querySelector('#custom-amount').addEventListener('input', function() {
        modal.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    });
}

// ===== PROCESS DONATION =====
function processDonation(amount, type) {
    // Show loading notification
    showNotification('Redirection vers la page de paiement...', 'info');
    
    // Simulate payment processing (replace with actual payment gateway integration)
    setTimeout(() => {
        showNotification(`Merci pour votre don de ${amount} FCFA !`, 'success');
        
        // Here you would integrate with payment gateways like:
        // - Flutterwave
        // - Paystack
        // - Mobile Money (MTN, Moov, etc.)
        // - PayPal
    }, 2000);
}

// ===== GALLERY FUNCTIONALITY =====
function initGallery() {
    const galleryImages = document.querySelectorAll('.gallery-item');
    
    galleryImages.forEach(image => {
        image.addEventListener('click', function() {
            showImageModal(this.src, this.alt);
        });
    });
}

// ===== IMAGE MODAL =====
function showImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'modal image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${alt}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${src}" alt="${alt}" class="modal-image">
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }
    });
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(scrollToTopBtn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });

    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== INITIALIZE ADDITIONAL FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
    initDonation();
    initGallery();
    initScrollToTop();
});

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.OEDApp = {
    showNotification,
    validateEmail,
    validatePhone,
    showDonationModal,
    processDonation
};
