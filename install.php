<?php
/**
 * Script d'installation pour le site OASIS ÉDUCATION ET DÉVELOPPEMENT
 * Ce script configure la base de données et les paramètres de base
 */

// Configuration de base
$config_file = 'php/config.php';
$database_file = 'php/database.sql';

// Vérification des prérequis
$errors = [];
$warnings = [];

// Vérifier PHP version
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    $errors[] = "PHP 7.4.0 ou plus récent est requis. Version actuelle : " . PHP_VERSION;
}

// Vérifier l'extension PDO
if (!extension_loaded('pdo')) {
    $errors[] = "L'extension PDO est requise pour la base de données.";
}

// Vérifier l'extension PDO MySQL
if (!extension_loaded('pdo_mysql')) {
    $errors[] = "L'extension PDO MySQL est requise.";
}

// Vérifier les permissions d'écriture
if (!is_writable('.')) {
    $errors[] = "Le répertoire racine doit être accessible en écriture.";
}

if (!is_writable('php/')) {
    $errors[] = "Le répertoire php/ doit être accessible en écriture.";
}

// Traitement du formulaire d'installation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? 'oasis_education_dev');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');
    $admin_email = trim($_POST['admin_email'] ?? '');
    $site_name = trim($_POST['site_name'] ?? 'OASIS ÉDUCATION ET DÉVELOPPEMENT');
    $site_url = trim($_POST['site_url'] ?? '');
    
    $install_errors = [];
    
    // Validation des données
    if (empty($db_user)) {
        $install_errors[] = "Le nom d'utilisateur de la base de données est requis.";
    }
    
    if (empty($admin_email) || !filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
        $install_errors[] = "Une adresse email admin valide est requise.";
    }
    
    if (empty($site_url) || !filter_var($site_url, FILTER_VALIDATE_URL)) {
        $install_errors[] = "Une URL de site valide est requise.";
    }
    
    // Test de connexion à la base de données
    if (empty($install_errors)) {
        try {
            $dsn = "mysql:host=$db_host;charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            
            // Créer la base de données si elle n'existe pas
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$db_name`");
            
            // Lire et exécuter le script SQL
            if (file_exists($database_file)) {
                $sql = file_get_contents($database_file);
                $statements = explode(';', $sql);
                
                foreach ($statements as $statement) {
                    $statement = trim($statement);
                    if (!empty($statement)) {
                        $pdo->exec($statement);
                    }
                }
            }
            
            // Créer le fichier de configuration
            $config_content = "<?php
/**
 * Configuration de la base de données pour OASIS ÉDUCATION ET DÉVELOPPEMENT
 */

// Configuration de la base de données
define('DB_HOST', '$db_host');
define('DB_NAME', '$db_name');
define('DB_USER', '$db_user');
define('DB_PASS', '$db_pass');
define('DB_CHARSET', 'utf8mb4');

// Configuration du site
define('SITE_NAME', '$site_name');
define('SITE_URL', '$site_url');
define('ADMIN_EMAIL', '$admin_email');

// Configuration de sécurité
define('SECRET_KEY', '" . bin2hex(random_bytes(32)) . "');
define('ENCRYPTION_KEY', '" . bin2hex(random_bytes(16)) . "');

// Configuration email
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('SMTP_FROM', ADMIN_EMAIL);
define('SMTP_FROM_NAME', SITE_NAME);

// Configuration des dossiers
define('UPLOAD_DIR', 'uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// Configuration de l'application
define('DEBUG_MODE', false);
define('MAINTENANCE_MODE', false);

// Configuration des cookies
define('COOKIE_LIFETIME', 86400 * 30); // 30 jours

// Configuration des sessions
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset(\$_SERVER['HTTPS']));

// Démarrer la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Fonction de connexion à la base de données
function getDBConnection() {
    try {
        \$dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return \$pdo;
    } catch (PDOException \$e) {
        error_log('Erreur de connexion à la base de données : ' . \$e->getMessage());
        if (DEBUG_MODE) {
            die('Erreur de connexion à la base de données : ' . \$e->getMessage());
        } else {
            die('Erreur de connexion à la base de données. Veuillez contacter l\'administrateur.');
        }
    }
}

// Fonction de validation des emails
function isValidEmail(\$email) {
    return filter_var(\$email, FILTER_VALIDATE_EMAIL) !== false;
}

// Fonction de nettoyage des données
function sanitizeInput(\$data) {
    return htmlspecialchars(strip_tags(trim(\$data)), ENT_QUOTES, 'UTF-8');
}

// Fonction de génération de token CSRF
function generateCSRFToken() {
    if (!isset(\$_SESSION['csrf_token'])) {
        \$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return \$_SESSION['csrf_token'];
}

// Fonction de validation du token CSRF
function validateCSRFToken(\$token) {
    return isset(\$_SESSION['csrf_token']) && hash_equals(\$_SESSION['csrf_token'], \$token);
}

// Fonction d'envoi d'email
function sendEmail(\$to, \$subject, \$message, \$headers = '') {
    \$default_headers = 'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM . '>' . "\r\n";
    \$default_headers .= 'Reply-To: ' . SMTP_FROM . "\r\n";
    \$default_headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
    \$default_headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
    
    \$headers = \$headers ?: \$default_headers;
    
    return mail(\$to, \$subject, \$message, \$headers);
}

// Fonction de log des erreurs
function logError(\$message, \$context = []) {
    \$log_message = date('Y-m-d H:i:s') . ' - ' . \$message;
    if (!empty(\$context)) {
        \$log_message .= ' - Context: ' . json_encode(\$context);
    }
    error_log(\$log_message);
}

// Fonction de redirection
function redirect(\$url) {
    header('Location: ' . \$url);
    exit;
}

// Fonction de formatage des dates
function formatDate(\$date, \$format = 'd/m/Y H:i') {
    return date(\$format, strtotime(\$date));
}

// Fonction de formatage des montants
function formatAmount(\$amount) {
    return number_format(\$amount, 0, ',', ' ') . ' FCFA';
}
";

            if (file_put_contents($config_file, $config_content) === false) {
                $install_errors[] = "Impossible de créer le fichier de configuration.";
            }
            
            // Créer le répertoire uploads
            if (!is_dir('uploads')) {
                mkdir('uploads', 0755, true);
            }
            
            // Créer les sous-répertoires
            $upload_dirs = ['uploads/images', 'uploads/documents', 'uploads/avatars', 'uploads/projects'];
            foreach ($upload_dirs as $dir) {
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
            }
            
            $success = true;
            
        } catch (PDOException $e) {
            $install_errors[] = "Erreur de connexion à la base de données : " . $e->getMessage();
        } catch (Exception $e) {
            $install_errors[] = "Erreur lors de l'installation : " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - OASIS ÉDUCATION ET DÉVELOPPEMENT</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #2E8B57, #1E90FF);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .install-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }
        
        .install-header {
            background: linear-gradient(135deg, #2E8B57, #1E90FF);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .install-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .install-header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .install-content {
            padding: 40px;
        }
        
        .status-section {
            margin-bottom: 30px;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            background: #f8f9fa;
        }
        
        .status-item.error {
            background: #ffe6e6;
            color: #d63384;
        }
        
        .status-item.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-item.success {
            background: #d1edff;
            color: #0c5460;
        }
        
        .status-icon {
            margin-right: 15px;
            font-size: 1.2rem;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #2E8B57;
        }
        
        .btn {
            background: linear-gradient(135deg, #2E8B57, #1E90FF);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
            width: 100%;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .success-message {
            background: #d1edff;
            color: #0c5460;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .error-message {
            background: #ffe6e6;
            color: #d63384;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .error-message ul {
            margin-left: 20px;
        }
        
        .install-steps {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .install-steps h3 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .install-steps ol {
            margin-left: 20px;
        }
        
        .install-steps li {
            margin-bottom: 8px;
            color: #666;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .install-header h1 {
                font-size: 2rem;
            }
            
            .install-content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="install-header">
            <h1>🌍 OED</h1>
            <p>Installation du site web OASIS ÉDUCATION ET DÉVELOPPEMENT</p>
        </div>
        
        <div class="install-content">
            <?php if (!empty($errors)): ?>
                <div class="error-message">
                    <h3>❌ Erreurs détectées</h3>
                    <ul>
                        <?php foreach ($errors as $error): ?>
                            <li><?php echo htmlspecialchars($error); ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <p><strong>Veuillez corriger ces erreurs avant de continuer l'installation.</strong></p>
                </div>
            <?php elseif (isset($success) && $success): ?>
                <div class="success-message">
                    <h3>✅ Installation réussie !</h3>
                    <p>Le site OASIS ÉDUCATION ET DÉVELOPPEMENT a été installé avec succès.</p>
                    <p><strong>Important :</strong> Supprimez ce fichier install.php pour des raisons de sécurité.</p>
                    <br>
                    <a href="index.html" class="btn" style="text-decoration: none; display: inline-block; width: auto; padding: 10px 20px;">Accéder au site</a>
                </div>
            <?php else: ?>
                <?php if (!empty($warnings)): ?>
                    <div class="status-section">
                        <?php foreach ($warnings as $warning): ?>
                            <div class="status-item warning">
                                <span class="status-icon">⚠️</span>
                                <span><?php echo htmlspecialchars($warning); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <div class="status-section">
                    <h3>Vérification des prérequis</h3>
                    <div class="status-item <?php echo version_compare(PHP_VERSION, '7.4.0', '>=') ? 'success' : 'error'; ?>">
                        <span class="status-icon"><?php echo version_compare(PHP_VERSION, '7.4.0', '>=') ? '✅' : '❌'; ?></span>
                        <span>PHP <?php echo PHP_VERSION; ?> <?php echo version_compare(PHP_VERSION, '7.4.0', '>=') ? '(Compatible)' : '(Version 7.4+ requise)'; ?></span>
                    </div>
                    <div class="status-item <?php echo extension_loaded('pdo') ? 'success' : 'error'; ?>">
                        <span class="status-icon"><?php echo extension_loaded('pdo') ? '✅' : '❌'; ?></span>
                        <span>Extension PDO <?php echo extension_loaded('pdo') ? '(Installée)' : '(Manquante)'; ?></span>
                    </div>
                    <div class="status-item <?php echo extension_loaded('pdo_mysql') ? 'success' : 'error'; ?>">
                        <span class="status-icon"><?php echo extension_loaded('pdo_mysql') ? '✅' : '❌'; ?></span>
                        <span>Extension PDO MySQL <?php echo extension_loaded('pdo_mysql') ? '(Installée)' : '(Manquante)'; ?></span>
                    </div>
                    <div class="status-item <?php echo is_writable('.') && is_writable('php/') ? 'success' : 'error'; ?>">
                        <span class="status-icon"><?php echo is_writable('.') && is_writable('php/') ? '✅' : '❌'; ?></span>
                        <span>Permissions d'écriture <?php echo is_writable('.') && is_writable('php/') ? '(OK)' : '(Problème)'; ?></span>
                    </div>
                </div>
                
                <?php if (empty($errors)): ?>
                    <div class="install-steps">
                        <h3>📋 Étapes d'installation</h3>
                        <ol>
                            <li>Créer une base de données MySQL</li>
                            <li>Remplir les informations de connexion</li>
                            <li>Configurer les paramètres du site</li>
                            <li>Lancer l'installation automatique</li>
                        </ol>
                    </div>
                    
                    <?php if (!empty($install_errors)): ?>
                        <div class="error-message">
                            <h3>❌ Erreurs d'installation</h3>
                            <ul>
                                <?php foreach ($install_errors as $error): ?>
                                    <li><?php echo htmlspecialchars($error); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST">
                        <h3>🗄️ Configuration de la base de données</h3>
                        <div class="form-group">
                            <label for="db_host">Hôte de la base de données :</label>
                            <input type="text" id="db_host" name="db_host" value="localhost" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="db_name">Nom de la base de données :</label>
                            <input type="text" id="db_name" name="db_name" value="oasis_education_dev" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="db_user">Nom d'utilisateur :</label>
                            <input type="text" id="db_user" name="db_user" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="db_pass">Mot de passe :</label>
                            <input type="password" id="db_pass" name="db_pass">
                        </div>
                        
                        <h3>⚙️ Configuration du site</h3>
                        <div class="form-group">
                            <label for="site_name">Nom du site :</label>
                            <input type="text" id="site_name" name="site_name" value="OASIS ÉDUCATION ET DÉVELOPPEMENT" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="site_url">URL du site :</label>
                            <input type="url" id="site_url" name="site_url" placeholder="https://votre-domaine.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="admin_email">Email administrateur :</label>
                            <input type="email" id="admin_email" name="admin_email" required>
                        </div>
                        
                        <button type="submit" class="btn">🚀 Lancer l'installation</button>
                    </form>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        
        <div class="footer">
            <p>OASIS ÉDUCATION ET DÉVELOPPEMENT - Installation v1.0</p>
            <p>Développé avec ❤️ pour l'éducation et le développement durable au Bénin</p>
        </div>
    </div>
</body>
</html>
