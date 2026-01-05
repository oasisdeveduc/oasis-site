<?php
// ===== ADMIN PANEL =====

require_once 'config.php';

// Simple admin authentication (in production, use proper authentication)
session_start();

// Check if user is logged in as admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_login'])) {
        $username = sanitizeInput($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        
        // Simple hardcoded admin credentials (change in production)
        if ($username === 'admin' && $password === 'oasis2024') {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $username;
            logActivity('admin_login', "Admin logged in: $username");
        } else {
            $error = 'Identifiants incorrects.';
        }
    }
    
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Administration - OASIS ÉDUCATION ET DÉVELOPPEMENT</title>
        <link rel="stylesheet" href="../css/style.css">
        <style>
            .admin-login {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--gradient-primary);
            }
            .login-form {
                background: white;
                padding: 3rem;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 400px;
                width: 100%;
            }
            .login-form h2 {
                text-align: center;
                margin-bottom: 2rem;
                color: var(--primary-green);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 2px solid var(--light-gray);
                border-radius: 5px;
                font-size: 1rem;
            }
            .form-group input:focus {
                outline: none;
                border-color: var(--primary-green);
            }
            .error {
                color: var(--danger);
                margin-bottom: 1rem;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="admin-login">
            <div class="login-form">
                <h2>Administration OED</h2>
                <?php if (isset($error)): ?>
                    <div class="error"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                <form method="POST">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" name="admin_login" class="btn btn-primary" style="width: 100%;">Se connecter</button>
                </form>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle logout
if (isset($_GET['logout'])) {
    logActivity('admin_logout', "Admin logged out: " . $_SESSION['admin_username']);
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Get database connection
$pdo = getDBConnection();

// Get statistics
$stats = [];
try {
    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $stats['total_users'] = $stmt->fetch()['total'];
    
    // Pending users
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE status = 'pending'");
    $stats['pending_users'] = $stmt->fetch()['total'];
    
    // Total donations
    $stmt = $pdo->query("SELECT COUNT(*) as total, SUM(amount) as total_amount FROM donations WHERE payment_status = 'completed'");
    $donationStats = $stmt->fetch();
    $stats['total_donations'] = $donationStats['total'];
    $stats['total_amount'] = $donationStats['total_amount'] ?? 0;
    
    // Newsletter subscribers
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM newsletter_subscribers WHERE status = 'active'");
    $stats['newsletter_subscribers'] = $stmt->fetch()['total'];
    
    // Recent contact messages
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contact_messages WHERE status = 'new'");
    $stats['new_messages'] = $stmt->fetch()['total'];
    
} catch (Exception $e) {
    error_log("Stats query error: " . $e->getMessage());
}

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'approve_user':
                $userId = (int)$_POST['user_id'];
                $stmt = $pdo->prepare("UPDATE users SET status = 'approved' WHERE id = ?");
                if ($stmt->execute([$userId])) {
                    logActivity('user_approved', "User ID $userId approved", $userId);
                    $success = "Utilisateur approuvé avec succès.";
                }
                break;
                
            case 'reject_user':
                $userId = (int)$_POST['user_id'];
                $stmt = $pdo->prepare("UPDATE users SET status = 'rejected' WHERE id = ?");
                if ($stmt->execute([$userId])) {
                    logActivity('user_rejected', "User ID $userId rejected", $userId);
                    $success = "Utilisateur rejeté.";
                }
                break;
                
            case 'mark_message_read':
                $messageId = (int)$_POST['message_id'];
                $stmt = $pdo->prepare("UPDATE contact_messages SET status = 'read' WHERE id = ?");
                if ($stmt->execute([$messageId])) {
                    $success = "Message marqué comme lu.";
                }
                break;
        }
    }
}

// Get recent data
$recentUsers = [];
$recentMessages = [];
$recentDonations = [];

try {
    // Recent users
    $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at DESC LIMIT 10");
    $recentUsers = $stmt->fetchAll();
    
    // Recent messages
    $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 10");
    $recentMessages = $stmt->fetchAll();
    
    // Recent donations
    $stmt = $pdo->query("SELECT * FROM donations WHERE payment_status = 'completed' ORDER BY created_at DESC LIMIT 10");
    $recentDonations = $stmt->fetchAll();
    
} catch (Exception $e) {
    error_log("Data query error: " . $e->getMessage());
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration - OASIS ÉDUCATION ET DÉVELOPPEMENT</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .admin-header {
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }
        .admin-header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .admin-nav {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .admin-nav a {
            padding: 10px 20px;
            background: var(--primary-white);
            color: var(--primary-green);
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .admin-nav a:hover,
        .admin-nav a.active {
            background: var(--primary-green);
            color: white;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            color: var(--primary-green);
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .stat-card p {
            color: var(--medium-gray);
            margin: 0;
        }
        .data-table {
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        .data-table h3 {
            padding: 1rem 1.5rem;
            margin: 0;
            background: var(--background-gray);
            color: var(--primary-green);
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th,
        .table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--light-gray);
        }
        .table th {
            background: var(--background-gray);
            font-weight: 600;
            color: var(--primary-green);
        }
        .table tr:hover {
            background: var(--background-gray);
        }
        .status-pending {
            color: var(--warning);
            font-weight: 600;
        }
        .status-approved {
            color: var(--success);
            font-weight: 600;
        }
        .status-rejected {
            color: var(--danger);
            font-weight: 600;
        }
        .btn-small {
            padding: 5px 10px;
            font-size: 0.8rem;
            margin: 0 2px;
        }
        .alert {
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
        }
        .alert-success {
            background: rgba(40, 167, 69, 0.1);
            color: var(--success);
            border: 1px solid var(--success);
        }
    </style>
</head>
<body>
    <div class="admin-header">
        <div class="container">
            <h1><i class="fas fa-cog"></i> Administration OED</h1>
            <div>
                <span>Connecté en tant que: <strong><?= htmlspecialchars($_SESSION['admin_username']) ?></strong></span>
                <a href="admin.php?logout=1" class="btn btn-outline" style="margin-left: 1rem; color: white; border-color: white;">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </a>
            </div>
        </div>
    </div>

    <div class="container">
        <?php if (isset($success)): ?>
            <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
        <?php endif; ?>

        <div class="admin-nav">
            <a href="#dashboard" class="active">Tableau de bord</a>
            <a href="#users">Utilisateurs</a>
            <a href="#messages">Messages</a>
            <a href="#donations">Dons</a>
            <a href="#newsletter">Newsletter</a>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3><?= $stats['total_users'] ?? 0 ?></h3>
                <p>Utilisateurs totaux</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['pending_users'] ?? 0 ?></h3>
                <p>En attente d'approbation</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['total_donations'] ?? 0 ?></h3>
                <p>Dons reçus</p>
            </div>
            <div class="stat-card">
                <h3><?= number_format($stats['total_amount'] ?? 0, 0, ',', ' ') ?> FCFA</h3>
                <p>Montant total</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['newsletter_subscribers'] ?? 0 ?></h3>
                <p>Abonnés newsletter</p>
            </div>
            <div class="stat-card">
                <h3><?= $stats['new_messages'] ?? 0 ?></h3>
                <p>Nouveaux messages</p>
            </div>
        </div>

        <!-- Recent Users -->
        <div class="data-table">
            <h3><i class="fas fa-users"></i> Utilisateurs récents</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentUsers as $user): ?>
                    <tr>
                        <td><?= htmlspecialchars($user['fullname']) ?></td>
                        <td><?= htmlspecialchars($user['email']) ?></td>
                        <td><?= htmlspecialchars($user['user_type']) ?></td>
                        <td>
                            <span class="status-<?= $user['status'] ?>">
                                <?= ucfirst($user['status']) ?>
                            </span>
                        </td>
                        <td><?= date('d/m/Y H:i', strtotime($user['created_at'])) ?></td>
                        <td>
                            <?php if ($user['status'] === 'pending'): ?>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="approve_user">
                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                    <button type="submit" class="btn btn-primary btn-small">Approuver</button>
                                </form>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="reject_user">
                                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                    <button type="submit" class="btn btn-secondary btn-small">Rejeter</button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Recent Messages -->
        <div class="data-table">
            <h3><i class="fas fa-envelope"></i> Messages récents</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Sujet</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentMessages as $message): ?>
                    <tr>
                        <td><?= htmlspecialchars($message['name']) ?></td>
                        <td><?= htmlspecialchars($message['email']) ?></td>
                        <td><?= htmlspecialchars($message['subject'] ?: 'Aucun sujet') ?></td>
                        <td>
                            <span class="status-<?= $message['status'] ?>">
                                <?= ucfirst($message['status']) ?>
                            </span>
                        </td>
                        <td><?= date('d/m/Y H:i', strtotime($message['created_at'])) ?></td>
                        <td>
                            <?php if ($message['status'] === 'new'): ?>
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="mark_message_read">
                                    <input type="hidden" name="message_id" value="<?= $message['id'] ?>">
                                    <button type="submit" class="btn btn-primary btn-small">Marquer comme lu</button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Recent Donations -->
        <div class="data-table">
            <h3><i class="fas fa-heart"></i> Dons récents</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Donateur</th>
                        <th>Email</th>
                        <th>Montant</th>
                        <th>Type</th>
                        <th>Fréquence</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentDonations as $donation): ?>
                    <tr>
                        <td><?= $donation['anonymous'] ? 'Anonyme' : htmlspecialchars($donation['donor_name'] ?: 'Non fourni') ?></td>
                        <td><?= $donation['anonymous'] ? 'Anonyme' : htmlspecialchars($donation['donor_email'] ?: 'Non fourni') ?></td>
                        <td><?= number_format($donation['amount'], 0, ',', ' ') ?> FCFA</td>
                        <td><?= htmlspecialchars($donation['donation_type']) ?></td>
                        <td><?= htmlspecialchars($donation['frequency']) ?></td>
                        <td><?= date('d/m/Y H:i', strtotime($donation['created_at'])) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
