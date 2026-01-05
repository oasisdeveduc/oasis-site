<?php
// ===== NEWSLETTER SUBSCRIPTION HANDLER =====

require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Check rate limiting
if (!checkRateLimit('newsletter', 3, 300)) { // 3 requests per 5 minutes
    errorResponse('Trop de tentatives. Veuillez attendre avant de vous réabonner.', 429);
}

try {
    // Get and sanitize input data
    $email = sanitizeInput($_POST['email'] ?? '');
    
    // Validate email
    if (empty($email)) {
        errorResponse('L\'adresse email est requise.');
    }
    
    if (!validateEmail($email)) {
        errorResponse('Veuillez entrer une adresse email valide.');
    }
    
    // Get database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        errorResponse('Erreur de connexion à la base de données.', 500);
    }
    
    // Check if email is already subscribed
    $stmt = $pdo->prepare("SELECT id, status FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    $existingSubscriber = $stmt->fetch();
    
    if ($existingSubscriber) {
        if ($existingSubscriber['status'] === 'active') {
            errorResponse('Cette adresse email est déjà abonnée à notre newsletter.');
        } else {
            // Reactivate subscription
            $stmt = $pdo->prepare("
                UPDATE newsletter_subscribers 
                SET status = 'active', subscribed_at = NOW(), unsubscribed_at = NULL 
                WHERE email = ?
            ");
            $stmt->execute([$email]);
            
            logActivity('newsletter_resubscription', "User $email resubscribed to newsletter");
            
            // Send welcome back email
            $subject = "Bienvenue de retour ! - " . SITE_NAME;
            $message = "
                <h2>Bienvenue de retour !</h2>
                <p>Nous sommes ravis de vous revoir !</p>
                <p>Votre abonnement à la newsletter de " . SITE_NAME . " a été réactivé.</p>
                <p>Vous recevrez désormais nos dernières actualités, nos rapports d'activités et nos invitations aux événements.</p>
                <p>Merci de votre fidélité !</p>
                <hr>
                <p><small>Pour vous désabonner, cliquez sur le lien de désabonnement en bas de nos emails.</small></p>
                <p><strong>" . SITE_NAME . "</strong><br>
                " . SITE_ADDRESS . "<br>
                " . SITE_EMAIL . " | " . SITE_PHONE . "</p>
            ";
            
            $emailSent = sendEmail($email, $subject, $message);
            
            successResponse('Votre abonnement à la newsletter a été réactivé ! Bienvenue de retour !', [
                'action' => 'reactivated',
                'email_sent' => $emailSent
            ]);
        }
    } else {
        // Create new subscription
        $stmt = $pdo->prepare("
            INSERT INTO newsletter_subscribers (email, status, subscribed_at) 
            VALUES (?, 'active', NOW())
        ");
        $result = $stmt->execute([$email]);
        
        if (!$result) {
            errorResponse('Erreur lors de l\'enregistrement de votre abonnement.', 500);
        }
        
        $subscriberId = $pdo->lastInsertId();
        
        logActivity('newsletter_subscription', "New newsletter subscription: $email", null);
        
        // Send welcome email
        $subject = "Bienvenue dans notre communauté ! - " . SITE_NAME;
        $message = "
            <h2>Bienvenue dans notre communauté !</h2>
            <p>Merci de vous être abonné(e) à la newsletter de " . SITE_NAME . " !</p>
            <p>Vous recevrez désormais :</p>
            <ul>
                <li>Nos dernières actualités et projets</li>
                <li>Nos rapports d'activités</li>
                <li>Les invitations à nos événements</li>
                <li>Les témoignages de nos bénéficiaires</li>
                <li>Les opportunités de bénévolat</li>
            </ul>
            <p>Nous sommes ravis de vous compter parmi nos supporters !</p>
            <p>Ensemble, nous pouvons créer un impact positif dans notre communauté.</p>
            <hr>
            <p><small>Pour vous désabonner, cliquez sur le lien de désabonnement en bas de nos emails.</small></p>
            <p><strong>" . SITE_NAME . "</strong><br>
            " . SITE_ADDRESS . "<br>
            " . SITE_EMAIL . " | " . SITE_PHONE . "</p>
        ";
        
        $emailSent = sendEmail($email, $subject, $message);
        
        // Send notification to admin
        $adminSubject = "Nouvel abonné à la newsletter - " . SITE_NAME;
        $adminMessage = "
            <h2>Nouvel abonné à la newsletter</h2>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Date d'abonnement:</strong> " . date('d/m/Y H:i:s') . "</p>
            <p><strong>ID abonné:</strong> $subscriberId</p>
        ";
        
        $adminEmailSent = sendEmail(SITE_EMAIL, $adminSubject, $adminMessage);
        
        successResponse('Merci ! Vous êtes maintenant abonné(e) à notre newsletter.', [
            'action' => 'subscribed',
            'subscriber_id' => $subscriberId,
            'email_sent' => $emailSent,
            'admin_email_sent' => $adminEmailSent
        ]);
    }
    
} catch (Exception $e) {
    error_log("Newsletter subscription error: " . $e->getMessage());
    errorResponse('Une erreur est survenue lors de l\'abonnement à la newsletter. Veuillez réessayer plus tard.', 500);
}
?>
