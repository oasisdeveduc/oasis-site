<?php
// ===== JOIN FORM HANDLER =====

require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

// Check rate limiting
if (!checkRateLimit('join_form', 2, 600)) { // 2 requests per 10 minutes
    errorResponse('Trop de tentatives. Veuillez attendre avant de soumettre une nouvelle candidature.', 429);
}

try {
    // Get and sanitize input data
    $fullname = sanitizeInput($_POST['fullname'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $age = (int)($_POST['age'] ?? 0);
    $address = sanitizeInput($_POST['address'] ?? '');
    $profession = sanitizeInput($_POST['profession'] ?? '');
    $organization = sanitizeInput($_POST['organization'] ?? '');
    $motivation = sanitizeInput($_POST['motivation'] ?? '');
    $skills = sanitizeInput($_POST['skills'] ?? '');
    $availability = sanitizeInput($_POST['availability'] ?? '');
    $hearAbout = sanitizeInput($_POST['hear-about'] ?? '');
    $joinType = sanitizeInput($_POST['join-type'] ?? 'member');
    $newsletter = isset($_POST['newsletter']);
    $privacy = isset($_POST['privacy']);
    
    // Validate required fields
    $errors = [];
    
    if (empty($fullname)) {
        $errors[] = 'Le nom complet est requis.';
    } elseif (strlen($fullname) < 2) {
        $errors[] = 'Le nom complet doit contenir au moins 2 caractères.';
    }
    
    if (empty($email)) {
        $errors[] = 'L\'email est requis.';
    } elseif (!validateEmail($email)) {
        $errors[] = 'Veuillez entrer une adresse email valide.';
    }
    
    if (empty($phone)) {
        $errors[] = 'Le téléphone est requis.';
    } elseif (!validatePhone($phone)) {
        $errors[] = 'Veuillez entrer un numéro de téléphone valide.';
    }
    
    if (empty($address)) {
        $errors[] = 'L\'adresse est requise.';
    } elseif (strlen($address) < 10) {
        $errors[] = 'L\'adresse doit contenir au moins 10 caractères.';
    }
    
    if (empty($motivation)) {
        $errors[] = 'La motivation est requise.';
    } elseif (strlen($motivation) < 50) {
        $errors[] = 'La motivation doit contenir au moins 50 caractères.';
    }
    
    if ($age > 0 && ($age < 18 || $age > 100)) {
        $errors[] = 'L\'âge doit être entre 18 et 100 ans.';
    }
    
    if (!$privacy) {
        $errors[] = 'Vous devez accepter la politique de confidentialité.';
    }
    
    if (!in_array($joinType, ['member', 'volunteer', 'partner'])) {
        $errors[] = 'Type de candidature invalide.';
    }
    
    if (!empty($errors)) {
        errorResponse(implode(' ', $errors));
    }
    
    // Get database connection
    $pdo = getDBConnection();
    if (!$pdo) {
        errorResponse('Erreur de connexion à la base de données.', 500);
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        errorResponse('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.');
    }
    
    // Insert user into database
    $stmt = $pdo->prepare("
        INSERT INTO users (
            fullname, email, phone, age, address, profession, organization,
            motivation, skills, availability, hear_about, user_type,
            newsletter_subscription, privacy_accepted, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([
        $fullname, $email, $phone, $age, $address, $profession, $organization,
        $motivation, $skills, $availability, $hearAbout, $joinType,
        $newsletter, $privacy
    ]);
    
    if (!$result) {
        errorResponse('Erreur lors de l\'enregistrement de votre candidature.', 500);
    }
    
    $userId = $pdo->lastInsertId();
    
    // Log activity
    logActivity('user_registration', "New $joinType registration: $fullname ($email)", $userId);
    
    // Send notification email to admin
    $joinTypeLabels = [
        'member' => 'membre',
        'volunteer' => 'bénévole',
        'partner' => 'partenaire'
    ];
    
    $adminSubject = "Nouvelle candidature " . $joinTypeLabels[$joinType] . " - " . SITE_NAME;
    $adminMessage = "
        <h2>Nouvelle candidature " . ucfirst($joinTypeLabels[$joinType]) . "</h2>
        <p><strong>Nom complet:</strong> $fullname</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Téléphone:</strong> $phone</p>
        <p><strong>Âge:</strong> " . ($age ?: 'Non fourni') . "</p>
        <p><strong>Adresse:</strong> $address</p>
        <p><strong>Profession:</strong> " . ($profession ?: 'Non fournie') . "</p>
        <p><strong>Organisation:</strong> " . ($organization ?: 'Non fournie') . "</p>
        <p><strong>Motivation:</strong></p>
        <p>" . nl2br($motivation) . "</p>
        <p><strong>Compétences:</strong></p>
        <p>" . nl2br($skills ?: 'Non fournies') . "</p>
        <p><strong>Disponibilité:</strong></p>
        <p>" . nl2br($availability ?: 'Non fournie') . "</p>
        <p><strong>Comment a-t-il/elle entendu parler de OED:</strong> " . ($hearAbout ?: 'Non spécifié') . "</p>
        <p><strong>Newsletter:</strong> " . ($newsletter ? 'Oui' : 'Non') . "</p>
        <p><strong>Date:</strong> " . date('d/m/Y H:i:s') . "</p>
        <p><strong>ID utilisateur:</strong> $userId</p>
    ";
    
    // Send confirmation email to user
    $userSubject = "Confirmation de candidature - " . SITE_NAME;
    $userMessage = "
        <h2>Merci pour votre candidature</h2>
        <p>Bonjour $fullname,</p>
        <p>Nous avons bien reçu votre candidature pour devenir " . $joinTypeLabels[$joinType] . " de " . SITE_NAME . ".</p>
        <p>Notre équipe va examiner votre dossier et nous vous contacterons dans les plus brefs délais pour vous informer de la suite du processus.</p>
        <p><strong>Résumé de votre candidature:</strong></p>
        <ul>
            <li><strong>Type:</strong> " . ucfirst($joinTypeLabels[$joinType]) . "</li>
            <li><strong>Nom:</strong> $fullname</li>
            <li><strong>Email:</strong> $email</li>
            <li><strong>Date de candidature:</strong> " . date('d/m/Y H:i:s') . "</li>
        </ul>
        <p>En attendant, n'hésitez pas à nous contacter si vous avez des questions.</p>
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
        logActivity('email_sent', "Join notification sent to admin for user ID: $userId");
    }
    if ($userEmailSent) {
        logActivity('email_sent', "Join confirmation sent to $email for user ID: $userId");
    }
    
    // Add to newsletter if requested
    if ($newsletter) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO newsletter_subscribers (email, status, subscribed_at) 
                VALUES (?, 'active', NOW())
                ON DUPLICATE KEY UPDATE status = 'active', subscribed_at = NOW()
            ");
            $stmt->execute([$email]);
            logActivity('newsletter_subscription', "User $email subscribed to newsletter", $userId);
        } catch (Exception $e) {
            error_log("Newsletter subscription error: " . $e->getMessage());
        }
    }
    
    // Return success response
    successResponse('Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt pour vous informer de la suite du processus.', [
        'user_id' => $userId,
        'join_type' => $joinType,
        'admin_email_sent' => $adminEmailSent,
        'user_email_sent' => $userEmailSent
    ]);
    
} catch (Exception $e) {
    error_log("Join form error: " . $e->getMessage());
    errorResponse('Une erreur est survenue lors de l\'enregistrement de votre candidature. Veuillez réessayer plus tard.', 500);
}
?>
