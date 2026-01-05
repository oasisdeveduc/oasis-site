<?php
// ===== CONTACT FORM HANDLER =====

require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Check rate limiting
if (!checkRateLimit('contact_form', 3, 300)) { // 3 requests per 5 minutes
    errorResponse('Trop de tentatives. Veuillez attendre avant de renvoyer un message.', 429);
}

try {
    // Get and sanitize input data
    $name = sanitizeInput($_POST['name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $subject = sanitizeInput($_POST['subject'] ?? '');
    $message = sanitizeInput($_POST['message'] ?? '');
    
    // Validate required fields
    $errors = [];
    
    if (empty($name)) {
        $errors[] = 'Le nom est requis.';
    } elseif (strlen($name) < 2) {
        $errors[] = 'Le nom doit contenir au moins 2 caractères.';
    }
    
    if (empty($email)) {
        $errors[] = 'L\'email est requis.';
    } elseif (!validateEmail($email)) {
        $errors[] = 'Veuillez entrer une adresse email valide.';
    }
    
    if (empty($message)) {
        $errors[] = 'Le message est requis.';
    } elseif (strlen($message) < 10) {
        $errors[] = 'Le message doit contenir au moins 10 caractères.';
    }
    
    // Validate phone if provided
    if (!empty($phone) && !validatePhone($phone)) {
        $errors[] = 'Veuillez entrer un numéro de téléphone valide.';
    }
    
    if (!empty($errors)) {
        errorResponse(implode(' ', $errors));
    }
    
    // Get database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        errorResponse('Erreur de connexion à la base de données.', 500);
    }
    
    // Insert message into database
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, phone, subject, message, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([$name, $email, $phone, $subject, $message]);
    
    if (!$result) {
        errorResponse('Erreur lors de l\'enregistrement du message.', 500);
    }
    
    $messageId = $pdo->lastInsertId();
    
    // Log activity
    logActivity('contact_message', "New contact message from $email", null);
    
    // Send notification email to admin
    $adminSubject = "Nouveau message de contact - " . SITE_NAME;
    $adminMessage = "
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Téléphone:</strong> " . ($phone ?: 'Non fourni') . "</p>
        <p><strong>Sujet:</strong> " . ($subject ?: 'Aucun sujet') . "</p>
        <p><strong>Message:</strong></p>
        <p>" . nl2br($message) . "</p>
        <p><strong>Date:</strong> " . date('d/m/Y H:i:s') . "</p>
        <p><strong>ID du message:</strong> $messageId</p>
    ";
    
    // Send confirmation email to user
    $userSubject = "Confirmation de réception - " . SITE_NAME;
    $userMessage = "
        <h2>Merci pour votre message</h2>
        <p>Bonjour $name,</p>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p><strong>Votre message:</strong></p>
        <p>" . nl2br($message) . "</p>
        <hr>
        <p><small>Ceci est un message automatique de confirmation. Merci de ne pas y répondre.</small></p>
        <p><strong>" . SITE_NAME . "</strong><br>
        " . SITE_ADDRESS . "<br>
        " . SITE_EMAIL . " | " . SITE_PHONE . "</p>
    ";
    
    // Try to send emails
    $adminEmailSent = sendEmail(SITE_EMAIL, $adminSubject, $adminMessage);
    $userEmailSent = sendEmail($email, $userSubject, $userMessage);
    
    // Log email sending results
    if ($adminEmailSent) {
        logActivity('email_sent', "Contact notification sent to admin for message ID: $messageId");
    }
    if ($userEmailSent) {
        logActivity('email_sent', "Contact confirmation sent to $email for message ID: $messageId");
    }
    
    // Return success response
    successResponse('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', [
        'message_id' => $messageId,
        'admin_email_sent' => $adminEmailSent,
        'user_email_sent' => $userEmailSent
    ]);
    
} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    errorResponse('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.', 500);
}
?>
