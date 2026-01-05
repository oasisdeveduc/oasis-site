// JavaScript pour la page des actualités
document.addEventListener('DOMContentLoaded', function() {
    // Filtrage des articles par catégorie
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Mise à jour des boutons actifs
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrage des articles
            newsCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Bouton "Charger plus"
    const loadMoreBtn = document.getElementById('load-more-btn');
    let visibleArticles = 8; // Nombre d'articles visibles initialement
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simuler le chargement de plus d'articles
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
            this.disabled = true;
            
            setTimeout(() => {
                // Ici, vous pourriez charger plus d'articles via AJAX
                this.innerHTML = '<i class="fas fa-check"></i> Tous les articles chargés';
                this.style.display = 'none';
            }, 1500);
        });
    }

    // Animation des cartes d'actualités au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer toutes les cartes d'actualités
    newsCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Formulaire de newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Animation de chargement
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            submitBtn.disabled = true;
            
            // Simuler l'envoi
            setTimeout(() => {
                // Ici, vous pourriez envoyer les données via AJAX
                showNotification('Inscription réussie ! Vous recevrez nos actualités par email.', 'success');
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.reset();
            }, 2000);
        });
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Recherche dans les articles (si implémentée)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            newsCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const content = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Partage d'articles sur les réseaux sociaux
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const articleTitle = this.closest('.news-card').querySelector('h3').textContent;
            const articleUrl = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: articleTitle,
                    url: articleUrl
                });
            } else {
                // Fallback pour les navigateurs qui ne supportent pas l'API Share
                const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
                window.open(shareUrl, '_blank');
            }
        });
    });

    // Lazy loading des images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Tri des articles par date
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            const newsGrid = document.querySelector('.news-grid');
            const cards = Array.from(newsCards);
            
            cards.sort((a, b) => {
                const dateA = new Date(a.querySelector('.date').textContent);
                const dateB = new Date(b.querySelector('.date').textContent);
                
                if (sortBy === 'newest') {
                    return dateB - dateA;
                } else {
                    return dateA - dateB;
                }
            });
            
            // Réorganiser les cartes dans le DOM
            cards.forEach(card => {
                newsGrid.appendChild(card);
            });
        });
    }

    // Pagination (si implémentée)
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            // Mise à jour de l'URL
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            window.history.pushState({}, '', url);
            
            // Charger le contenu de la page
            loadPage(page);
        });
    });

    function loadPage(page) {
        // Animation de chargement
        const newsGrid = document.querySelector('.news-grid');
        newsGrid.style.opacity = '0.5';
        
        // Simuler le chargement
        setTimeout(() => {
            // Ici, vous pourriez charger le contenu via AJAX
            newsGrid.style.opacity = '1';
        }, 1000);
    }

    // Gestion des liens d'articles (simulation)
    const articleLinks = document.querySelectorAll('.read-more, .news-card h3 a');
    articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('href').substring(1);
            
            // Afficher un modal avec le contenu de l'article
            showArticleModal(articleId);
        });
    });

    function showArticleModal(articleId) {
        // Créer un modal pour afficher l'article complet
        const modal = document.createElement('div');
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-body">
                        <h2>Article complet</h2>
                        <p>Contenu complet de l'article ${articleId}...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer le modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });
    }

    // Gestion des archives
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(item => {
        item.addEventListener('click', function() {
            const month = this.querySelector('h3').textContent;
            
            // Filtrer les articles par mois
            newsCards.forEach(card => {
                const cardDate = new Date(card.querySelector('.date').textContent);
                const cardMonth = cardDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                
                if (cardMonth.toLowerCase() === month.toLowerCase()) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Scroll vers la grille d'articles
            document.querySelector('.news-grid-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Styles CSS pour les notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 12px;
    }
    
    .notification-content i {
        color: var(--primary-color);
        font-size: 20px;
    }
    
    .notification-content span {
        color: var(--text-dark);
        font-weight: 500;
    }
`;

// Ajouter les styles CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
