<?php
// ===== DONATION HANDLER =====

require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Check rate limiting
if (!checkRateLimit('donation_form', 5, 300)) { // 5 requests per 5 minutes
    errorResponse('Trop de tentatives. Veuillez attendre avant de refaire un don.', 429);
}

try {
    // Get and sanitize input data
    $donorName = sanitizeInput($_POST['donor-name'] ?? '');
    $donorEmail = sanitizeInput($_POST['donor-email'] ?? '');
    $amount = (float)($_POST['amount'] ?? 0);
    $donationType = sanitizeInput($_POST['donation-type'] ?? 'general');
    $frequency = sanitizeInput($_POST['frequency'] ?? 'one-time');
    $anonymous = isset($_POST['anonymous']);
    $notes = sanitizeInput($_POST['notes'] ?? '');
    
    // Validate required fields
    $errors = [];
    
    if ($amount <= 0) {
        $errors[] = 'Le montant doit être supérieur à 0.';
    } elseif ($amount < 1000) {
        $errors[] = 'Le montant minimum est de 1000 FCFA.';
    }
    
    if (!in_array($donationType, ['general', 'women', 'children', 'environment', 'health', 'education'])) {
        $errors[] = 'Type de don invalide.';
    }
    
    if (!in_array($frequency, ['one-time', 'monthly'])) {
        $errors[] = 'Fréquence de don invalide.';
    }
    
    if (!empty($donorEmail) && !validateEmail($donorEmail)) {
        $errors[] = 'Veuillez entrer une adresse email valide.';
    }
    
    if (!empty($errors)) {
        errorResponse(implode(' ', $errors));
    }
    
    // Get database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        errorResponse('Erreur de connexion à la base de données.', 500);
    }
    
    // Generate payment reference
    $paymentReference = 'OED-' . date('Ymd') . '-' . strtoupper(uniqid());
    
    // Insert donation into database
    $stmt = $pdo->prepare("
        INSERT INTO donations (
            donor_name, donor_email, amount, currency, donation_type, frequency,
            anonymous, payment_reference, notes, created_at
        ) VALUES (?, ?, ?, 'XOF', ?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([
        $anonymous ? null : $donorName,
        $anonymous ? null : $donorEmail,
        $amount,
        $donationType,
        $frequency,
        $anonymous,
        $paymentReference,
        $notes
    ]);
    
    if (!$result) {
        errorResponse('Erreur lors de l\'enregistrement du don.', 500);
    }
    
    $donationId = $pdo->lastInsertId();
    
    // Log activity
    $logDetails = "Donation: $amount FCFA ($donationType, $frequency)";
    if (!$anonymous && $donorEmail) {
        $logDetails .= " from $donorEmail";
    }
    logActivity('donation_received', $logDetails, null);
    
    // Send notification email to admin
    $donationTypeLabels = [
        'general' => 'Général',
        'women' => 'Autonomisation des femmes',
        'children' => 'Protection des enfants',
        'environment' => 'Protection environnementale',
        'health' => 'Santé',
        'education' => 'Éducation'
    ];
    
    $frequencyLabels = [
        'one-time' => 'Unique',
        'monthly' => 'Mensuel'
    ];
    
    $adminSubject = "Nouveau don reçu - " . SITE_NAME;
    $adminMessage = "
        <h2>Nouveau don reçu</h2>
        <p><strong>Montant:</strong> " . number_format($amount, 0, ',', ' ') . " FCFA</p>
        <p><strong>Type:</strong> " . $donationTypeLabels[$donationType] . "</p>
        <p><strong>Fréquence:</strong> " . $frequencyLabels[$frequency] . "</p>
        <p><strong>Anonyme:</strong> " . ($anonymous ? 'Oui' : 'Non') . "</p>
        " . (!$anonymous ? "<p><strong>Donateur:</strong> $donorName</p>" : "") . "
        " . (!$anonymous && $donorEmail ? "<p><strong>Email:</strong> $donorEmail</p>" : "") . "
        <p><strong>Référence de paiement:</strong> $paymentReference</p>
        <p><strong>Notes:</strong> " . ($notes ?: 'Aucune') . "</p>
        <p><strong>Date:</strong> " . date('d/m/Y H:i:s') . "</p>
        <p><strong>ID du don:</strong> $donationId</p>
    ";
    
    // Send confirmation email to donor (if not anonymous and email provided)
    $donorEmailSent = false;
    if (!$anonymous && $donorEmail) {
        $donorSubject = "Confirmation de don - " . SITE_NAME;
        $donorMessage = "
            <h2>Merci pour votre don</h2>
            <p>Bonjour " . ($donorName ?: 'Cher donateur') . ",</p>
            <p>Nous vous remercions chaleureusement pour votre généreux don de <strong>" . number_format($amount, 0, ',', ' ') . " FCFA</strong>.</p>
            <p><strong>Détails de votre don:</strong></p>
            <ul>
                <li><strong>Montant:</strong> " . number_format($amount, 0, ',', ' ') . " FCFA</li>
                <li><strong>Type:</strong> " . $donationTypeLabels[$donationType] . "</li>
                <li><strong>Fréquence:</strong> " . $frequencyLabels[$frequency] . "</li>
                <li><strong>Référence:</strong> $paymentReference</li>
                <li><strong>Date:</strong> " . date('d/m/Y H:i:s') . "</li>
            </ul>
            <p>Votre contribution nous aide à continuer nos actions pour l'éducation et le développement durable dans notre communauté.</p>
            <p>Nous vous tiendrons informé(e) de l'utilisation de votre don et de l'impact qu'il génère.</p>
            <hr>
            <p><small>Ceci est un message automatique de confirmation. Merci de ne pas y répondre.</small></p>
            <p><strong>" . SITE_NAME . "</strong><br>
            " . SITE_ADDRESS . "<br>
            " . SITE_EMAIL . " | " . SITE_PHONE . "</p>
        ";
        
        $donorEmailSent = sendEmail($donorEmail, $donorSubject, $donorMessage);
    }
    
    // Try to send admin email
    $adminEmailSent = sendEmail(SITE_EMAIL, $adminSubject, $adminMessage);
    
    // Log email sending results
    if ($adminEmailSent) {
        logActivity('email_sent', "Donation notification sent to admin for donation ID: $donationId");
    }
    if ($donorEmailSent) {
        logActivity('email_sent', "Donation confirmation sent to $donorEmail for donation ID: $donationId");
    }
    
    // Here you would integrate with payment gateways
    // For now, we'll simulate a successful payment
    $paymentStatus = 'completed';
    
    // Update payment status
    $stmt = $pdo->prepare("UPDATE donations SET payment_status = ? WHERE id = ?");
    $stmt->execute([$paymentStatus, $donationId]);
    
    // Return success response
    successResponse('Votre don a été enregistré avec succès ! Merci pour votre générosité.', [
        'donation_id' => $donationId,
        'payment_reference' => $paymentReference,
        'amount' => $amount,
        'donation_type' => $donationType,
        'frequency' => $frequency,
        'admin_email_sent' => $adminEmailSent,
        'donor_email_sent' => $donorEmailSent,
        'payment_status' => $paymentStatus
    ]);
    
} catch (Exception $e) {
    error_log("Donation form error: " . $e->getMessage());
    errorResponse('Une erreur est survenue lors de l\'enregistrement de votre don. Veuillez réessayer plus tard.', 500);
}
?>
