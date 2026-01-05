# Configuration Stripe pour les Paiements par Carte Bancaire

Ce guide vous explique comment configurer Stripe pour permettre les paiements par carte bancaire sur le site OASIS ÉDUCATION ET DÉVELOPPEMENT.

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Compte bancaire** : Vous devez avoir un compte bancaire pour recevoir les paiements
3. **Documentation légale** : Selon votre pays, vous devrez fournir des documents d'identité

## 🔧 Configuration Stripe

### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Cliquez sur "Créer un compte"
3. Remplissez vos informations personnelles ou d'entreprise
4. Vérifiez votre email

### 2. Activer votre compte

1. Connectez-vous à votre tableau de bord Stripe
2. Complétez votre profil (informations bancaires, documents d'identité)
3. Attendez la validation de votre compte

### 3. Récupérer vos clés API

1. Dans votre tableau de bord Stripe, allez dans "Développeurs" > "Clés API"
2. Copiez vos clés :
   - **Clé publique** (commence par `pk_test_` ou `pk_live_`)
   - **Clé secrète** (commence par `sk_test_` ou `sk_live_`)

### 4. Configurer les webhooks

1. Dans Stripe, allez dans "Développeurs" > "Webhooks"
2. Cliquez sur "Ajouter un endpoint"
3. URL : `https://votre-domaine.com/php/stripe-webhook.php`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Copiez la clé secrète du webhook (commence par `whsec_`)

## 🔐 Configuration du Site

### 1. Mettre à jour les clés Stripe

Éditez le fichier `js/stripe-payment.js` :

```javascript
// Remplacez par votre clé publique Stripe
const stripe = Stripe('pk_test_51234567890abcdef...');
```

Éditez le fichier `php/create-payment-intent.php` :

```php
// Remplacez par votre clé secrète Stripe
$stripe_secret_key = 'sk_test_...';
```

Éditez le fichier `php/stripe-webhook.php` :

```php
// Remplacez par votre clé secrète Stripe
$stripe_secret_key = 'sk_test_...';

// Remplacez par votre webhook secret
$webhook_secret = 'whsec_...';
```

### 2. Installer le SDK Stripe PHP

```bash
composer require stripe/stripe-php
```

Ou téléchargez le SDK manuellement et placez-le dans le dossier `vendor/`.

### 3. Configurer les emails

Dans `php/config.php`, configurez les paramètres SMTP :

```php
define('SMTP_HOST', 'votre-serveur-smtp.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'votre-email@smtp.com');
define('SMTP_PASS', 'votre-mot-de-passe');
```

## 💳 Types de Cartes Acceptées

Stripe accepte automatiquement :
- **Visa**
- **Mastercard**
- **American Express**
- **Discover**
- **Diners Club**
- **JCB**

## 🌍 Devises Supportées

Le site est configuré pour accepter les paiements en **FCFA (Franc CFA de l'Afrique de l'Ouest)**.

Pour changer la devise, modifiez dans `php/create-payment-intent.php` :

```php
'currency' => 'xof', // Changez pour 'usd', 'eur', etc.
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer les clés secrètes** dans le code côté client
2. **Utiliser HTTPS** pour toutes les communications
3. **Valider les webhooks** avec la signature Stripe
4. **Loguer les erreurs** pour le débogage

### Variables d'Environnement (Recommandé)

Créez un fichier `.env` :

```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📊 Gestion des Paiements

### Tableau de Bord Stripe

Vous pouvez gérer vos paiements depuis le tableau de bord Stripe :
- Voir tous les paiements
- Gérer les remboursements
- Exporter les données
- Configurer les notifications

### Base de Données

Le site enregistre automatiquement :
- Détails des dons
- Statuts des paiements
- Informations des donateurs
- Historique des transactions

## 🧪 Mode Test vs Production

### Mode Test
- Utilisez les clés qui commencent par `pk_test_` et `sk_test_`
- Les paiements ne sont pas réels
- Utilisez les cartes de test Stripe

### Mode Production
- Utilisez les clés qui commencent par `pk_live_` et `sk_live_`
- Les paiements sont réels
- Assurez-vous que votre compte est validé

## 📞 Support

### En cas de problème

1. **Vérifiez les logs** dans `error_log`
2. **Testez avec les cartes de test** Stripe
3. **Vérifiez la configuration** des webhooks
4. **Contactez le support Stripe** si nécessaire

### Cartes de Test Stripe

```
Visa : 4242 4242 4242 4242
Mastercard : 5555 5555 5555 4444
American Express : 3782 822463 10005

Date d'expiration : n'importe quelle date future
CVC : n'importe quel code à 3 chiffres
```

## 📈 Analytics et Rapports

Stripe fournit des rapports détaillés sur :
- Volume des transactions
- Taux de succès des paiements
- Géographie des donateurs
- Moyennes des dons

## 🔄 Mises à Jour

Assurez-vous de mettre à jour régulièrement :
- Le SDK Stripe PHP
- Les clés API si nécessaire
- Les configurations de sécurité

---

## ⚠️ Important

1. **Testez toujours en mode test** avant de passer en production
2. **Sauvegardez vos clés** en lieu sûr
3. **Surveillez vos transactions** régulièrement
4. **Respectez les réglementations** locales sur les paiements

Pour toute question, consultez la [documentation officielle Stripe](https://stripe.com/docs).
