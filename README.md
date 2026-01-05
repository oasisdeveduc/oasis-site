# 🌍 OASIS ÉDUCATION ET DÉVELOPPEMENT - Site Web

Site web professionnel pour l'ONG OASIS ÉDUCATION ET DÉVELOPPEMENT basée à Djougou, Bénin.

## 📋 Description

Ce projet est un site web moderne et responsive développé pour présenter l'ONG OASIS ÉDUCATION ET DÉVELOPPEMENT, ses missions, ses projets et faciliter la prise de contact, l'adhésion et les dons en ligne.

## ✨ Fonctionnalités

### 🏠 Pages principales
- **Accueil** : Présentation de l'ONG avec statistiques et actions principales
- **À propos** : Histoire, mission, vision, valeurs et structure organisationnelle
- **Nos actions** : Galerie de projets avec filtres et détails
- **Équipe** : Présentation des membres de l'équipe
- **Actualités** : Blog et articles d'actualités
- **Rejoindre OED** : Formulaires d'adhésion, bénévolat et dons
- **Contact** : Formulaire de contact, carte interactive et FAQ

### 🔧 Fonctionnalités techniques
- **Design responsive** : Adapté à tous les appareils (desktop, tablette, mobile)
- **Formulaires fonctionnels** : Contact, adhésion, dons avec validation
- **Base de données** : MySQL avec structure complète
- **Administration** : Panneau d'administration pour gérer le contenu
- **Sécurité** : Protection CSRF, validation des données, limitation de taux
- **Performance** : Optimisé pour le chargement rapide
- **SEO** : Meta tags et structure optimisée pour les moteurs de recherche

### 🎨 Charte graphique
- **Couleurs principales** : Vert (#2E8B57), Bleu (#1E90FF), Blanc (#FFFFFF)
- **Police** : Poppins (Google Fonts)
- **Style** : Moderne, professionnel, humanitaire
- **Icônes** : Font Awesome 6.0

## 🚀 Installation

### Prérequis
- Serveur web (Apache/Nginx)
- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Composer (optionnel)

### Étapes d'installation

1. **Cloner ou télécharger le projet**
   ```bash
   git clone [URL_DU_REPO] oasis-education-dev
   cd oasis-education-dev
   ```

2. **Configurer la base de données**
   - Créer une base de données MySQL nommée `oasis_education_dev`
   - Importer le fichier `php/database.sql`
   ```bash
   mysql -u root -p oasis_education_dev < php/database.sql
   ```

3. **Configurer les paramètres**
   - Modifier le fichier `php/config.php` avec vos paramètres :
     - Informations de connexion à la base de données
     - Adresse email du site
     - Configuration SMTP (optionnel)

4. **Configurer le serveur web**
   - Pointer le document root vers le dossier du projet
   - Activer les modules PHP nécessaires (PDO, MySQL, cURL)

5. **Permissions**
   ```bash
   chmod 755 css/ js/ images/
   chmod 644 *.html *.css *.js *.php
   ```

## 📁 Structure du projet

```
oasis-education-dev/
├── index.html              # Page d'accueil
├── about.html              # Page À propos
├── projects.html           # Page Nos actions
├── team.html              # Page Équipe
├── news.html              # Page Actualités
├── join.html              # Page Rejoindre OED
├── contact.html           # Page Contact
├── css/
│   └── style.css          # Feuille de style principale
├── js/
│   ├── script.js          # JavaScript principal
│   ├── projects.js        # JavaScript pour les projets
│   ├── join.js            # JavaScript pour l'adhésion
│   └── contact.js         # JavaScript pour le contact
├── php/
│   ├── config.php         # Configuration
│   ├── database.sql       # Structure de la base de données
│   ├── contact.php        # Gestionnaire formulaire contact
│   ├── join.php           # Gestionnaire formulaire adhésion
│   ├── donation.php       # Gestionnaire dons
│   ├── newsletter.php     # Gestionnaire newsletter
│   └── admin.php          # Panneau d'administration
├── images/                # Images du site
└── README.md             # Ce fichier
```

## 🔐 Administration

Accédez au panneau d'administration via : `votre-domaine.com/php/admin.php`

**Identifiants par défaut :**
- Nom d'utilisateur : `admin`
- Mot de passe : `oasis2024`

⚠️ **Important** : Changez ces identifiants dès la première connexion !

## 🎯 Objectifs de l'ONG

1. **Autonomisation des femmes** : Formation et suivi sur les activités génératrices de revenus
2. **Protection des personnes vulnérables** : Lutte contre les violences basées sur le genre
3. **Protection des orphelins** : Épanouissement et protection des enfants vulnérables
4. **Santé reproductive** : Amélioration de la santé et nutrition des populations défavorisées
5. **Protection environnementale** : Lutte contre la destruction de la biodiversité
6. **Lutte contre l'extrémisme** : Prévention de l'extrémisme violent
7. **Centres sociaux** : Création de centres pour l'éducation et l'insertion sociale

## 📱 Responsive Design

Le site est entièrement responsive et s'adapte à :
- **Desktop** : Écrans 1200px et plus
- **Tablette** : Écrans 768px à 1199px
- **Mobile** : Écrans jusqu'à 767px

## 🔧 Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec Grid et Flexbox
- **JavaScript ES6+** : Interactivité et validation
- **PHP 7.4+** : Backend et gestion des formulaires
- **MySQL** : Base de données
- **Font Awesome** : Icônes
- **Google Fonts** : Police Poppins

## 📧 Contact

**OASIS ÉDUCATION ET DÉVELOPPEMENT**
- 📍 **Adresse** : Djougou, Département de la Donga, République du Bénin
- 📞 **Téléphone** : +229 XX XX XX XX
- ✉️ **Email** : contact@oasis-education-dev.org
- 🌐 **Site web** : [votre-domaine.com]

## 📄 Licence

Ce projet est développé pour l'ONG OASIS ÉDUCATION ET DÉVELOPPEMENT. Tous droits réservés.

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question technique ou support :
- Créer une issue sur le repository
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour OASIS ÉDUCATION ET DÉVELOPPEMENT**
