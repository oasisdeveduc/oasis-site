// ===== PROJECTS PAGE JAVASCRIPT =====

// Project data
const projectsData = {
    'women': {
        title: 'Formation en activités génératrices de revenus',
        category: 'Autonomisation des femmes',
        status: 'En cours',
        image: 'images/project-women-empowerment.jpg',
        description: 'Programme de formation et d\'accompagnement des femmes dans le développement d\'activités génératrices de revenus pour leur autonomisation économique. Ce projet vise à renforcer les capacités des femmes et à les aider à créer des sources de revenus durables.',
        objectives: [
            'Former 200 femmes aux techniques de gestion d\'entreprise',
            'Accompagner 150 femmes dans le lancement de leurs activités',
            'Créer un réseau d\'entraide entre les femmes entrepreneures',
            'Améliorer les revenus des femmes participantes de 40%'
        ],
        results: [
            { label: 'Femmes formées', value: '150', icon: 'fas fa-female' },
            { label: 'Activités lancées', value: '120', icon: 'fas fa-business-time' },
            { label: 'Taux de réussite', value: '85%', icon: 'fas fa-chart-line' },
            { label: 'Revenus générés', value: '15M FCFA', icon: 'fas fa-coins' }
        ],
        gallery: [
            'images/gallery-women-1.jpg',
            'images/gallery-women-2.jpg',
            'images/gallery-women-3.jpg',
            'images/gallery-women-4.jpg'
        ]
    },
    'children': {
        title: 'Centre d\'accueil pour orphelins',
        category: 'Protection des enfants',
        status: 'En cours',
        image: 'images/project-children-protection.jpg',
        description: 'Création et gestion d\'un centre d\'accueil offrant éducation, soins et soutien psychologique aux enfants orphelins et vulnérables. Le centre fournit un environnement sûr et éducatif pour leur développement.',
        objectives: [
            'Accueillir 50 enfants orphelins et vulnérables',
            'Assurer leur scolarisation et suivi éducatif',
            'Fournir des soins de santé et nutrition',
            'Offrir un soutien psychologique adapté'
        ],
        results: [
            { label: 'Enfants accueillis', value: '45', icon: 'fas fa-child' },
            { label: 'Taux de scolarisation', value: '100%', icon: 'fas fa-graduation-cap' },
            { label: 'Enfants parrainés', value: '35', icon: 'fas fa-heart' },
            { label: 'Familles d\'accueil', value: '20', icon: 'fas fa-home' }
        ],
        gallery: [
            'images/gallery-children-1.jpg',
            'images/gallery-children-2.jpg',
            'images/gallery-children-3.jpg',
            'images/gallery-children-4.jpg'
        ]
    },
    'environment': {
        title: 'Programme de reforestation',
        category: 'Protection environnementale',
        status: 'En cours',
        image: 'images/project-environment.jpg',
        description: 'Initiative de reforestation et de sensibilisation à la protection de l\'environnement avec les communautés locales. Ce projet vise à lutter contre la déforestation et à promouvoir des pratiques durables.',
        objectives: [
            'Planter 10,000 arbres dans la région',
            'Sensibiliser 25 villages aux enjeux environnementaux',
            'Former 100 agriculteurs aux pratiques durables',
            'Créer des pépinières communautaires'
        ],
        results: [
            { label: 'Arbres plantés', value: '5,000', icon: 'fas fa-tree' },
            { label: 'Villages sensibilisés', value: '15', icon: 'fas fa-village' },
            { label: 'Agriculteurs formés', value: '75', icon: 'fas fa-seedling' },
            { label: 'Pépinières créées', value: '8', icon: 'fas fa-seedling' }
        ],
        gallery: [
            'images/gallery-environment-1.jpg',
            'images/gallery-environment-2.jpg',
            'images/gallery-environment-3.jpg',
            'images/gallery-environment-4.jpg'
        ]
    },
    'health': {
        title: 'Santé reproductive et nutrition',
        category: 'Santé',
        status: 'Terminé',
        image: 'images/project-health.jpg',
        description: 'Programme d\'amélioration de la santé reproductive et de la nutrition des populations défavorisées par l\'éducation et l\'accès aux soins de santé.',
        objectives: [
            'Sensibiliser 500 femmes à la santé reproductive',
            'Améliorer la nutrition de 200 enfants',
            'Former 50 agents de santé communautaires',
            'Distribuer des compléments nutritionnels'
        ],
        results: [
            { label: 'Femmes sensibilisées', value: '450', icon: 'fas fa-female' },
            { label: 'Enfants suivis', value: '180', icon: 'fas fa-child' },
            { label: 'Agents formés', value: '45', icon: 'fas fa-user-md' },
            { label: 'Consultations', value: '800', icon: 'fas fa-stethoscope' }
        ],
        gallery: [
            'images/gallery-health-1.jpg',
            'images/gallery-health-2.jpg',
            'images/gallery-health-3.jpg'
        ]
    },
    'education': {
        title: 'Centres sociaux et culturels',
        category: 'Éducation',
        status: 'En cours',
        image: 'images/project-education.jpg',
        description: 'Création de centres sociaux et culturels pour l\'éducation, la formation et l\'insertion sociale des jeunes et des adultes.',
        objectives: [
            'Créer 3 centres dans la région',
            'Former 300 jeunes aux compétences de base',
            'Offrir des cours d\'alphabétisation',
            'Organiser des activités culturelles'
        ],
        results: [
            { label: 'Centres créés', value: '2', icon: 'fas fa-building' },
            { label: 'Jeunes formés', value: '200', icon: 'fas fa-user-graduate' },
            { label: 'Adultes alphabétisés', value: '150', icon: 'fas fa-book' },
            { label: 'Activités organisées', value: '50', icon: 'fas fa-calendar' }
        ],
        gallery: [
            'images/gallery-education-1.jpg',
            'images/gallery-education-2.jpg',
            'images/gallery-education-3.jpg'
        ]
    },
    'violence': {
        title: 'Lutte contre les violences basées sur le genre',
        category: 'Protection',
        status: 'En cours',
        image: 'images/project-violence-prevention.jpg',
        description: 'Programme de protection et de soutien des victimes de violences basées sur le genre, incluant un accompagnement psychologique et juridique.',
        objectives: [
            'Sensibiliser 1000 personnes aux droits des femmes',
            'Accompagner 100 victimes de violences',
            'Former 30 agents de sensibilisation',
            'Créer un réseau d\'écoute et de soutien'
        ],
        results: [
            { label: 'Personnes sensibilisées', value: '800', icon: 'fas fa-users' },
            { label: 'Victimes accompagnées', value: '75', icon: 'fas fa-hands-helping' },
            { label: 'Agents formés', value: '25', icon: 'fas fa-user-shield' },
            { label: 'Cas résolus', value: '60', icon: 'fas fa-check-circle' }
        ],
        gallery: [
            'images/gallery-violence-1.jpg',
            'images/gallery-violence-2.jpg',
            'images/gallery-violence-3.jpg'
        ]
    },
    'peace': {
        title: 'Lutte contre l\'extrémisme violent',
        category: 'Paix',
        status: 'En cours',
        image: 'images/project-peace.jpg',
        description: 'Programme de sensibilisation et de prévention contre l\'extrémisme violent par l\'éducation, le dialogue interreligieux et la promotion de la paix.',
        objectives: [
            'Sensibiliser 500 jeunes aux dangers de l\'extrémisme',
            'Organiser 20 sessions de dialogue interreligieux',
            'Former 40 leaders religieux et communautaires',
            'Créer des espaces de dialogue et de paix'
        ],
        results: [
            { label: 'Jeunes sensibilisés', value: '400', icon: 'fas fa-user-graduate' },
            { label: 'Sessions organisées', value: '15', icon: 'fas fa-comments' },
            { label: 'Leaders formés', value: '35', icon: 'fas fa-crown' },
            { label: 'Espaces créés', value: '10', icon: 'fas fa-map-marker-alt' }
        ],
        gallery: [
            'images/gallery-peace-1.jpg',
            'images/gallery-peace-2.jpg',
            'images/gallery-peace-3.jpg'
        ]
    },
    'digital': {
        title: 'Formation numérique pour les jeunes',
        category: 'Innovation',
        status: 'En cours',
        image: 'images/project-digital.jpg',
        description: 'Programme de formation aux compétences numériques et à l\'entrepreneuriat pour les jeunes, leur permettant d\'accéder aux opportunités du monde numérique.',
        objectives: [
            'Former 200 jeunes aux compétences numériques',
            'Accompagner 50 jeunes dans l\'entrepreneuriat digital',
            'Créer un espace de coworking',
            'Organiser des hackathons et concours'
        ],
        results: [
            { label: 'Jeunes formés', value: '150', icon: 'fas fa-laptop-code' },
            { label: 'Startups créées', value: '25', icon: 'fas fa-rocket' },
            { label: 'Projets développés', value: '40', icon: 'fas fa-project-diagram' },
            { label: 'Emplois créés', value: '30', icon: 'fas fa-briefcase' }
        ],
        gallery: [
            'images/gallery-digital-1.jpg',
            'images/gallery-digital-2.jpg',
            'images/gallery-digital-3.jpg'
        ]
    },
    'community': {
        title: 'Développement communautaire',
        category: 'Développement',
        status: 'Terminé',
        image: 'images/project-community.jpg',
        description: 'Programme de développement communautaire intégré visant à améliorer les conditions de vie dans plusieurs villages de la région.',
        objectives: [
            'Améliorer l\'accès à l\'eau potable dans 10 villages',
            'Construire 5 écoles primaires',
            'Former 100 leaders communautaires',
            'Développer des activités génératrices de revenus'
        ],
        results: [
            { label: 'Villages touchés', value: '10', icon: 'fas fa-village' },
            { label: 'Écoles construites', value: '5', icon: 'fas fa-school' },
            { label: 'Leaders formés', value: '100', icon: 'fas fa-user-tie' },
            { label: 'Familles bénéficiaires', value: '500', icon: 'fas fa-home' }
        ],
        gallery: [
            'images/gallery-community-1.jpg',
            'images/gallery-community-2.jpg',
            'images/gallery-community-3.jpg'
        ]
    }
};

// Initialize projects page
document.addEventListener('DOMContentLoaded', function() {
    initProjectFilters();
    initProjectModals();
    initProjectGallery();
});

// Project filter functionality
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Project modal functionality
function initProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalClose = modal.querySelector('.modal-close');

    projectCards.forEach(card => {
        const learnMoreBtn = card.querySelector('.btn-primary');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const projectId = card.dataset.category;
                showProjectModal(projectId);
            });
        }
    });

    // Close modal
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Show project modal
function showProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    const modal = document.getElementById('project-modal');
    
    // Update modal content
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-category').textContent = project.category;
    document.getElementById('modal-status').textContent = project.status;
    document.getElementById('modal-image').src = project.image;
    document.getElementById('modal-image').alt = project.title;
    document.getElementById('modal-description').textContent = project.description;

    // Update objectives
    const objectivesList = document.getElementById('modal-objectives');
    objectivesList.innerHTML = '';
    project.objectives.forEach(objective => {
        const li = document.createElement('li');
        li.textContent = objective;
        objectivesList.appendChild(li);
    });

    // Update results
    const resultsGrid = document.getElementById('modal-results');
    resultsGrid.innerHTML = '';
    project.results.forEach(result => {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <div class="result-icon">
                <i class="${result.icon}"></i>
            </div>
            <div class="result-number">${result.value}</div>
            <div class="result-label">${result.label}</div>
        `;
        resultsGrid.appendChild(resultCard);
    });

    // Update gallery
    const galleryGrid = document.getElementById('modal-gallery');
    galleryGrid.innerHTML = '';
    project.gallery.forEach(imageSrc => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `<img src="${imageSrc}" alt="${project.title}" loading="lazy">`;
        galleryGrid.appendChild(galleryItem);
    });

    // Update donate button
    const donateBtn = document.getElementById('modal-donate');
    donateBtn.dataset.type = projectId;

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Gallery functionality
function initProjectGallery() {
    // This will be handled by the main script.js file
    // Gallery items are created dynamically in the modal
}

// Donation button functionality for projects
document.addEventListener('click', function(e) {
    if (e.target.closest('.donate-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.donate-btn');
        const amount = btn.dataset.amount;
        const type = btn.dataset.type;
        
        if (window.OEDApp && window.OEDApp.showDonationModal) {
            window.OEDApp.showDonationModal(amount, type);
        }
    }
});

// Animation on scroll for project cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const projectObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe project cards when they are added to DOM
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        projectObserver.observe(card);
    });
});

// Export functions for global use
window.ProjectsApp = {
    showProjectModal,
    projectsData
};
