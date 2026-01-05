// ===== OASIS EDUCATION ET DÉVELOPPEMENT - MAIN JAVASCRIPT FILE =====

document.addEventListener('DOMContentLoaded', () => {
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
  initDonation();
  initGallery();
  initScrollToTop();
  updateActiveNavLink();
}

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.header');

  if (!navToggle || !navMenu) return;

  // Create backdrop (for mobile menu)
  let backdrop = document.querySelector('.menu-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);
  }

  const setMenuTop = () => {
    // Keep menu under header on mobile
    if (header) {
      navMenu.style.top = `${header.offsetHeight}px`;
    }
  };

  const openMenu = () => {
    setMenuTop();
    navMenu.classList.add('active');
    navToggle.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
  };

  // Mobile menu toggle
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click (mobile)
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on backdrop click
  backdrop.addEventListener('click', closeMenu);

  // Close on outside click (desktop + mobile)
  document.addEventListener('click', (event) => {
    const clickedInside = navMenu.contains(event.target) || navToggle.contains(event.target);
    if (!clickedInside) closeMenu();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Recalculate top on resize
  window.addEventListener('resize', () => {
    if (navMenu.classList.contains('active')) setMenuTop();
  });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const header = document.querySelector('.header');
  if (!header) return;

  // Header scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      const headerHeight = header.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

// ===== ANIMATIONS =====
function initAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('animate-in');
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll(
    '.project-card, .hero-stats .stat-item, .intro-stats .stat-item, .mission-point, .card'
  );

  animateElements.forEach((el) => observer.observe(el));
}

// ===== FORM FUNCTIONALITY =====
function initForms() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContactForm);

  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterForm);

  const joinForm = document.getElementById('join-form');
  if (joinForm) joinForm.addEventListener('submit', handleJoinForm);
}

// ===== CONTACT FORM HANDLER =====
function handleContactForm(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formObject = {};
  formData.forEach((value, key) => (formObject[key] = value));

  if (validateContactForm(formObject)) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.innerHTML = '<span class="loading"></span> Envoi en cours...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      showNotification('Message envoyé avec succès !', 'success');
      e.target.reset();

      if (submitBtn) {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
      }
    }, 2000);
  }
}

// ===== CONTACT FORM VALIDATION =====
function validateContactForm(data) {
  let isValid = true;
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Veuillez entrer une adresse email valide';
    isValid = false;
  }

  if (data.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
    errors.phone = 'Veuillez entrer un numéro de téléphone valide';
    isValid = false;
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
    isValid = false;
  }

  displayFormErrors(errors);
  return isValid;
}

// ===== NEWSLETTER FORM HANDLER =====
function handleNewsletterForm(e) {
  e.preventDefault();

  const input = e.target.querySelector('input[type="email"]');
  const email = input ? input.value : '';

  if (validateEmail(email)) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) submitBtn.innerHTML = '<span class="loading"></span>';

    setTimeout(() => {
      showNotification("Merci pour votre inscription à notre newsletter !", "success");
      e.target.reset();
      if (submitBtn) submitBtn.innerHTML = originalHTML;
    }, 1500);
  } else {
    showNotification("Veuillez entrer une adresse email valide", "error");
  }
}

// ===== JOIN FORM HANDLER =====
function handleJoinForm(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const formObject = {};
  formData.forEach((value, key) => (formObject[key] = value));

  if (validateJoinForm(formObject)) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.innerHTML = '<span class="loading"></span> Traitement en cours...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      showNotification("Votre candidature a été envoyée avec succès !", "success");
      e.target.reset();

      if (submitBtn) {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
      }
    }, 3000);
  }
}

// ===== JOIN FORM VALIDATION =====
function validateJoinForm(data) {
  let isValid = true;
  const errors = {};

  if (!data.fullname || data.fullname.trim().length < 2) {
    errors.fullname = 'Le nom complet est requis';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Veuillez entrer une adresse email valide';
    isValid = false;
  }

  if (!data.phone || !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
    errors.phone = 'Veuillez entrer un numéro de téléphone valide';
    isValid = false;
  }

  if (!data.address || data.address.trim().length < 10) {
    errors.address = "L'adresse doit contenir au moins 10 caractères";
    isValid = false;
  }

  if (!data.motivation || data.motivation.trim().length < 50) {
    errors.motivation = 'La motivation doit contenir au moins 50 caractères';
    isValid = false;
  }

  displayFormErrors(errors);
  return isValid;
}

// ===== FORM ERROR DISPLAY =====
function displayFormErrors(errors) {
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach((el) => el.remove());

  // Remove previous error class
  document.querySelectorAll('.form-control.error').forEach((el) => el.classList.remove('error'));

  Object.keys(errors).forEach((fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.classList.add('error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = errors[fieldName];

    field.parentNode.appendChild(errorDiv);

    field.addEventListener(
      'input',
      function () {
        this.classList.remove('error');
        const errorMsg = this.parentNode.querySelector('.form-error');
        if (errorMsg) errorMsg.remove();
      },
      { once: true }
    );
  });
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  if (!('IntersectionObserver' in window)) return;

  const counters = document.querySelectorAll('.hero-stats .stat-number, .intro-stats .stat-number');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function animateCounter(element) {
  const raw = element.textContent.trim();
  const target = parseInt(raw.replace(/\D/g, ''), 10) || 0;
  const suffix = raw.replace(/[0-9]/g, ''); // keeps +, etc.

  const duration = 1800;
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    element.textContent = value.toLocaleString('fr-FR') + suffix;

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ===== IMAGE LAZY LOADING =====
function initImageLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  if (!('IntersectionObserver' in window)) {
    images.forEach((img) => (img.src = img.dataset.src));
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// ===== DONATION FUNCTIONALITY =====
function initDonation() {
  const donationButtons = document.querySelectorAll('.donate-btn');
  donationButtons.forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const amount = this.dataset.amount || '';
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
        <button class="modal-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="modal-body">
        <p>Votre don nous aide à continuer nos actions pour l'éducation et le développement durable.</p>
        <div class="donation-amounts">
          <button class="amount-btn" type="button" data-amount="5000">5 000 FCFA</button>
          <button class="amount-btn" type="button" data-amount="10000">10 000 FCFA</button>
          <button class="amount-btn" type="button" data-amount="25000">25 000 FCFA</button>
          <button class="amount-btn" type="button" data-amount="50000">50 000 FCFA</button>
        </div>
        <div class="custom-amount">
          <input type="number" id="custom-amount" placeholder="Montant personnalisé (FCFA)" min="0">
        </div>

        <div class="donation-type">
          <label><input type="radio" name="donation-type" value="general" checked> Don général</label>
          <label><input type="radio" name="donation-type" value="women"> Autonomisation des femmes</label>
          <label><input type="radio" name="donation-type" value="children"> Protection des enfants</label>
          <label><input type="radio" name="donation-type" value="environment"> Protection environnementale</label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-close" type="button">Annuler</button>
        <button class="btn btn-primary" id="proceed-donation" type="button">Procéder au don</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => {
    document.body.style.overflow = '';
    modal.remove();
  };

  // Set initial values
  if (amount) modal.querySelector('#custom-amount').value = amount;

  const typeInput = modal.querySelector(`input[name="donation-type"][value="${type}"]`);
  if (typeInput) typeInput.checked = true;

  // Close events
  modal.querySelectorAll('.modal-close').forEach((btn) => btn.addEventListener('click', close));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // ESC close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      close();
    }
  };
  document.addEventListener('keydown', escHandler);

  // Amount selection
  modal.querySelectorAll('.amount-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      modal.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
      this.classList.add('selected');
      modal.querySelector('#custom-amount').value = '';
    });
  });

  // Custom amount input
  modal.querySelector('#custom-amount').addEventListener('input', function () {
    modal.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('selected'));
  });

  // Proceed
  modal.querySelector('#proceed-donation').addEventListener('click', () => {
    const selectedAmount =
      modal.querySelector('.amount-btn.selected')?.dataset.amount ||
      modal.querySelector('#custom-amount').value;

    const selectedType = modal.querySelector('input[name="donation-type"]:checked')?.value || 'general';

    if (selectedAmount && Number(selectedAmount) > 0) {
      processDonation(selectedAmount, selectedType);
      close();
    } else {
      showNotification('Veuillez sélectionner un montant valide', 'error');
    }
  });
}

function processDonation(amount, type) {
  showNotification('Redirection vers la page de paiement...', 'info');
  setTimeout(() => {
    showNotification(`Merci pour votre don de ${Number(amount).toLocaleString('fr-FR')} FCFA !`, 'success');
  }, 1500);
}

// ===== GALLERY FUNCTIONALITY =====
function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  galleryItems.forEach((item) => {
    item.addEventListener('click', function () {
      // ✅ Fix: gallery-item is usually a div, so we find the image inside
      const img = this.querySelector('img');
      if (!img) return;
      showImageModal(img.src, img.alt || 'Image');
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
        <h3>${escapeHtml(alt)}</h3>
        <button class="modal-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="modal-body">
        <img src="${src}" alt="${escapeHtml(alt)}" class="modal-image">
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => {
    document.body.style.overflow = '';
    modal.remove();
  };

  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      close();
    }
  };
  document.addEventListener('keydown', escHandler);
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
  const existing = document.querySelector('.scroll-to-top');
  if (existing) return;

  const btn = document.createElement('button');
  btn.className = 'scroll-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';

  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.visibility = 'visible';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.style.opacity = '0';
      btn.style.visibility = 'hidden';
      btn.style.pointerEvents = 'none';
    }
  });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== UTILITIES =====
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || '').trim());
}

function validatePhone(phone) {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  return phoneRegex.test(String(phone || '').trim());
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${escapeHtml(message)}</span>
      <button class="notification-close" aria-label="Fermer">&times;</button>
    </div>
  `;

  document.body.appendChild(notification);

  const remove = () => {
    if (notification && notification.parentNode) notification.parentNode.removeChild(notification);
  };

  setTimeout(remove, 5000);
  notification.querySelector('.notification-close').addEventListener('click', remove);
}

// ✅ Active navigation link highlighting (robuste)
function updateActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  let path = window.location.pathname.split('/').pop(); // ex: index.html
  if (!path) path = 'index.html'; // if ends with /

  navLinks.forEach((link) => {
    link.classList.remove('active');

    const href = link.getAttribute('href');
    if (!href) return;

    // If we are on index
    if ((path === 'index.html' || path === '') && href === 'index.html') link.classList.add('active');
    // Other pages
    else if (href === path) link.classList.add('active');
  });
}

// Escape HTML (security)
function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.OEDApp = {
  showNotification,
  validateEmail,
  validatePhone,
  showDonationModal,
  processDonation,
};
