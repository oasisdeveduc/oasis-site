-- ===== DATABASE STRUCTURE FOR OASIS ÉDUCATION ET DÉVELOPPEMENT =====

-- Create database
CREATE DATABASE IF NOT EXISTS oasis_education_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oasis_education_dev;

-- Users table (for members, volunteers, partners)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    age INT,
    address TEXT,
    profession VARCHAR(255),
    organization VARCHAR(255),
    motivation TEXT,
    skills TEXT,
    availability TEXT,
    hear_about VARCHAR(100),
    user_type ENUM('member', 'volunteer', 'partner', 'admin') DEFAULT 'member',
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    newsletter_subscription BOOLEAN DEFAULT FALSE,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- Contact messages table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Donations table
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    donation_type ENUM('general', 'women', 'children', 'environment', 'health', 'education') DEFAULT 'general',
    frequency ENUM('one-time', 'monthly') DEFAULT 'one-time',
    anonymous BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donor_email (donor_email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_donation_type (donation_type),
    INDEX idx_created_at (created_at)
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Projects table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status ENUM('planning', 'ongoing', 'completed', 'suspended') DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    funds_raised DECIMAL(12, 2) DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_featured (featured)
);

-- Project galleries table
CREATE TABLE project_galleries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_sort_order (sort_order)
);

-- Project results table
CREATE TABLE project_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    result_type VARCHAR(100) NOT NULL,
    result_value VARCHAR(255) NOT NULL,
    result_label VARCHAR(255),
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
);

-- News/Articles table
CREATE TABLE news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(500),
    author_id INT,
    category VARCHAR(100),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at)
);

-- Team members table
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Settings table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_title', 'OASIS ÉDUCATION ET DÉVELOPPEMENT', 'Site title'),
('site_description', 'Organisation non gouvernementale apolitique et à but non lucratif œuvrant pour l\'éducation, la dignité et le développement durable au Bénin.', 'Site description'),
('contact_email', 'contact@oasis-education-dev.org', 'Contact email'),
('contact_phone', '+229 XX XX XX XX', 'Contact phone'),
('contact_address', 'Djougou, Donga, Bénin', 'Contact address'),
('facebook_url', '', 'Facebook page URL'),
('instagram_url', '', 'Instagram page URL'),
('linkedin_url', '', 'LinkedIn page URL'),
('twitter_url', '', 'Twitter page URL'),
('donation_goal', '1000000', 'Annual donation goal in FCFA'),
('volunteers_count', '50', 'Number of active volunteers'),
('beneficiaries_count', '2500', 'Number of beneficiaries'),
('projects_completed', '50', 'Number of completed projects');

-- Insert sample team members
INSERT INTO team_members (name, position, bio, sort_order) VALUES
('Directeur Exécutif', 'Directeur Exécutif', 'Dirige les opérations quotidiennes de l\'organisation et supervise la mise en œuvre des programmes.', 1),
('Coordinatrice des Projets', 'Coordinatrice des Projets', 'Responsable de la coordination et du suivi des projets de l\'organisation.', 2),
('Responsable Formation', 'Responsable Formation', 'En charge des programmes de formation et d\'autonomisation des femmes.', 3),
('Chargé de Communication', 'Chargé de Communication', 'Responsable de la communication externe et de la visibilité de l\'organisation.', 4);

-- Insert sample projects
INSERT INTO projects (title, description, category, status, featured, start_date) VALUES
('Formation en activités génératrices de revenus', 'Programme de formation et d\'accompagnement des femmes dans le développement d\'activités génératrices de revenus pour leur autonomisation économique.', 'women', 'ongoing', TRUE, '2024-01-01'),
('Centre d\'accueil pour orphelins', 'Création et gestion d\'un centre d\'accueil offrant éducation, soins et soutien psychologique aux enfants orphelins et vulnérables.', 'children', 'ongoing', TRUE, '2024-02-01'),
('Programme de reforestation', 'Initiative de reforestation et de sensibilisation à la protection de l\'environnement avec les communautés locales.', 'environment', 'ongoing', TRUE, '2024-03-01'),
('Santé reproductive et nutrition', 'Programme d\'amélioration de la santé reproductive et de la nutrition des populations défavorisées.', 'health', 'completed', FALSE, '2023-06-01'),
('Centres sociaux et culturels', 'Création de centres sociaux et culturels pour l\'éducation, la formation et l\'insertion sociale.', 'education', 'ongoing', FALSE, '2024-04-01'),
('Lutte contre les violences basées sur le genre', 'Programme de protection et de soutien des victimes de violences basées sur le genre.', 'women', 'ongoing', FALSE, '2024-05-01');

-- Insert sample project results
INSERT INTO project_results (project_id, result_type, result_value, result_label, icon) VALUES
(1, 'women_trained', '150', 'Femmes formées', 'fas fa-female'),
(1, 'activities_launched', '120', 'Activités lancées', 'fas fa-business-time'),
(1, 'success_rate', '85%', 'Taux de réussite', 'fas fa-chart-line'),
(1, 'revenue_generated', '15000000', 'Revenus générés (FCFA)', 'fas fa-coins'),
(2, 'children_cared', '45', 'Enfants accueillis', 'fas fa-child'),
(2, 'schooling_rate', '100%', 'Taux de scolarisation', 'fas fa-graduation-cap'),
(2, 'sponsored_children', '35', 'Enfants parrainés', 'fas fa-heart'),
(2, 'foster_families', '20', 'Familles d\'accueil', 'fas fa-home'),
(3, 'trees_planted', '5000', 'Arbres plantés', 'fas fa-tree'),
(3, 'villages_sensitized', '15', 'Villages sensibilisés', 'fas fa-village'),
(3, 'farmers_trained', '75', 'Agriculteurs formés', 'fas fa-seedling'),
(3, 'nurseries_created', '8', 'Pépinières créées', 'fas fa-seedling');

-- Insert sample news articles
INSERT INTO news_articles (title, slug, excerpt, content, category, status, published_at) VALUES
('Lancement du nouveau programme d\'autonomisation des femmes', 'lancement-programme-autonomisation-femmes', 'OED lance un nouveau programme ambitieux pour l\'autonomisation économique des femmes dans la région de Djougou.', 'Contenu complet de l\'article sur le lancement du programme d\'autonomisation des femmes...', 'Projets', 'published', '2024-01-15 10:00:00'),
('Succès du programme de reforestation 2024', 'succes-programme-reforestation-2024', 'Le programme de reforestation de OED a atteint ses objectifs avec plus de 5000 arbres plantés cette année.', 'Contenu complet de l\'article sur le succès du programme de reforestation...', 'Environnement', 'published', '2024-02-20 14:30:00'),
('Formation des bénévoles sur les droits des femmes', 'formation-benevoles-droits-femmes', 'OED organise une formation intensive pour ses bénévoles sur les droits des femmes et la lutte contre les violences basées sur le genre.', 'Contenu complet de l\'article sur la formation des bénévoles...', 'Formation', 'published', '2024-03-10 09:15:00');

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_news_articles_created_at ON news_articles(created_at);

-- Create views for common queries
CREATE VIEW active_members AS
SELECT id, fullname, email, phone, user_type, created_at
FROM users 
WHERE status = 'approved' AND user_type IN ('member', 'volunteer', 'partner');

CREATE VIEW donation_summary AS
SELECT 
    donation_type,
    COUNT(*) as total_donations,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM donations 
WHERE payment_status = 'completed'
GROUP BY donation_type;

CREATE VIEW project_progress AS
SELECT 
    p.id,
    p.title,
    p.budget,
    p.funds_raised,
    CASE 
        WHEN p.budget > 0 THEN ROUND((p.funds_raised / p.budget) * 100, 2)
        ELSE 0 
    END as progress_percentage
FROM projects p
WHERE p.status IN ('planning', 'ongoing');

-- Table des dons avec paiement Stripe
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    donation_type ENUM('general', 'women', 'children', 'environment') DEFAULT 'general',
    frequency ENUM('one-time', 'monthly') DEFAULT 'one-time',
    anonymous BOOLEAN DEFAULT FALSE,
    payment_intent_id VARCHAR(255) UNIQUE,
    stripe_payment_method VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    failure_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donor_email (donor_email),
    INDEX idx_status (status),
    INDEX idx_donation_type (donation_type),
    INDEX idx_created_at (created_at)
);

-- Table des souscriptions (dons mensuels)
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    status ENUM('active', 'canceled', 'past_due', 'unpaid') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP NULL,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    INDEX idx_stripe_subscription_id (stripe_subscription_id),
    INDEX idx_status (status)
);

-- Table des paiements (historique des paiements pour les souscriptions)
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'succeeded', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_stripe_payment_intent_id (stripe_payment_intent_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
);

-- Table des reçus fiscaux
CREATE TABLE receipts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT,
    receipt_number VARCHAR(50) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    fiscal_year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_fiscal_year (fiscal_year),
    INDEX idx_issued_date (issued_date)
);
