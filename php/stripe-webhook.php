<?php
/**
 * Webhook Stripe pour traiter les paiements confirmés
 */

require_once 'config.php';

// Configuration Stripe
$stripe_secret_key = 'sk_test_...'; // Remplacez par votre clé secrète Stripe
$webhook_secret = 'whsec_...'; // Remplacez par votre webhook secret

// Récupérer le payload
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $webhook_secret
    );
} catch(\UnexpectedValueException $e) {
    // Payload invalide
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Signature invalide
    http_response_code(400);
    exit();
}

// Traiter l'événement
switch ($event->type) {
    case 'payment_intent.succeeded':
        handlePaymentSucceeded($event->data->object);
        break;
        
    case 'payment_intent.payment_failed':
        handlePaymentFailed($event->data->object);
        break;
        
    case 'customer.subscription.created':
        handleSubscriptionCreated($event->data->object);
        break;
        
    case 'customer.subscription.deleted':
        handleSubscriptionDeleted($event->data->object);
        break;
        
    default:
        // Événement non géré
        break;
}

http_response_code(200);

/**
 * Traite un paiement réussi
 */
function handlePaymentSucceeded($payment_intent) {
    try {
        $pdo = getDBConnection();
        
        // Mettre à jour le statut du don
        $stmt = $pdo->prepare("
            UPDATE donations 
            SET status = 'completed', 
                payment_intent_id = ?, 
                stripe_payment_method = ?,
                completed_at = NOW()
            WHERE payment_intent_id = ?
        ");
        
        $stmt->execute([
            $payment_intent->id,
            $payment_intent->payment_method,
            $payment_intent->id
        ]);
        
        // Récupérer les détails du don
        $stmt = $pdo->prepare("SELECT * FROM donations WHERE payment_intent_id = ?");
        $stmt->execute([$payment_intent->id]);
        $donation = $stmt->fetch();
        
        if ($donation) {
            // Envoyer l'email de confirmation
            sendDonationConfirmationEmail($donation);
            
            // Envoyer la notification à l'admin
            sendAdminNotification($donation);
            
            // Si c'est un don mensuel, créer le plan de souscription
            if ($donation['frequency'] === 'monthly') {
                createMonthlySubscription($payment_intent, $donation);
            }
        }
        
        // Log du succès
        error_log("Paiement réussi pour le don ID: " . $donation['id']);
        
    } catch (Exception $e) {
        error_log('Erreur handlePaymentSucceeded: ' . $e->getMessage());
    }
}

/**
 * Traite un paiement échoué
 */
function handlePaymentFailed($payment_intent) {
    try {
        $pdo = getDBConnection();
        
        // Mettre à jour le statut du don
        $stmt = $pdo->prepare("
            UPDATE donations 
            SET status = 'failed', 
                failure_reason = ?,
                updated_at = NOW()
            WHERE payment_intent_id = ?
        ");
        
        $stmt->execute([
            $payment_intent->last_payment_error->message ?? 'Paiement échoué',
            $payment_intent->id
        ]);
        
        // Envoyer un email au donateur
        $stmt = $pdo->prepare("SELECT * FROM donations WHERE payment_intent_id = ?");
        $stmt->execute([$payment_intent->id]);
        $donation = $stmt->fetch();
        
        if ($donation) {
            sendPaymentFailedEmail($donation);
        }
        
        // Log de l'échec
        error_log("Paiement échoué pour le PaymentIntent: " . $payment_intent->id);
        
    } catch (Exception $e) {
        error_log('Erreur handlePaymentFailed: ' . $e->getMessage());
    }
}

/**
 * Crée une souscription mensuelle
 */
function createMonthlySubscription($payment_intent, $donation) {
    try {
        $stripe = new \Stripe\StripeClient($stripe_secret_key);
        
        // Créer le plan de prix
        $price = $stripe->prices->create([
            'unit_amount' => $donation['amount'] * 100,
            'currency' => 'xof',
            'recurring' => ['interval' => 'month'],
            'product_data' => [
                'name' => 'Don mensuel OED - ' . getDonationTypeName($donation['donation_type']),
                'description' => 'Don mensuel pour ' . getDonationTypeName($donation['donation_type'])
            ]
        ]);
        
        // Créer la souscription
        $subscription = $stripe->subscriptions->create([
            'customer' => $payment_intent->customer,
            'items' => [['price' => $price->id]],
            'metadata' => [
                'donation_type' => $donation['donation_type'],
                'anonymous' => $donation['anonymous'] ? 'true' : 'false',
                'donor_name' => $donation['donor_name'],
                'donor_email' => $donation['donor_email']
            ]
        ]);
        
        // Enregistrer la souscription dans la base de données
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            INSERT INTO subscriptions (
                donation_id, 
                stripe_subscription_id, 
                stripe_price_id, 
                status, 
                created_at
            ) VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $donation['id'],
            $subscription->id,
            $price->id,
            $subscription->status
        ]);
        
    } catch (Exception $e) {
        error_log('Erreur createMonthlySubscription: ' . $e->getMessage());
    }
}

/**
 * Envoie l'email de confirmation de don
 */
function sendDonationConfirmationEmail($donation) {
    $subject = "Confirmation de votre don - OASIS ÉDUCATION ET DÉVELOPPEMENT";
    
    $message = "
    <html>
    <head>
        <title>Confirmation de don</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #2E8B57, #1E90FF); color: white; padding: 30px; text-align: center;'>
                <h1>🌍 OASIS ÉDUCATION ET DÉVELOPPEMENT</h1>
                <h2>Merci pour votre générosité !</h2>
            </div>
            
            <div style='padding: 30px; background: #f8f9fa;'>
                <p>Bonjour " . htmlspecialchars($donation['donor_name']) . ",</p>
                
                <p>Nous vous remercions chaleureusement pour votre don de <strong>" . number_format($donation['amount'], 0, ',', ' ') . " FCFA</strong>.</p>
                
                <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3>Détails de votre don :</h3>
                    <ul>
                        <li><strong>Montant :</strong> " . number_format($donation['amount'], 0, ',', ' ') . " FCFA</li>
                        <li><strong>Type :</strong> " . getDonationTypeName($donation['donation_type']) . "</li>
                        <li><strong>Fréquence :</strong> " . ($donation['frequency'] === 'monthly' ? 'Don mensuel' : 'Don unique') . "</li>
                        <li><strong>Date :</strong> " . date('d/m/Y H:i', strtotime($donation['completed_at'])) . "</li>
                        <li><strong>Statut :</strong> Confirmé</li>
                    </ul>
                </div>
                
                <p>Votre contribution nous permet de continuer nos actions pour :</p>
                <ul>
                    <li>✅ L'autonomisation des femmes par la formation</li>
                    <li>✅ La protection des enfants vulnérables</li>
                    <li>✅ La lutte contre les violences basées sur le genre</li>
                    <li>✅ La protection de l'environnement</li>
                    <li>✅ L'éducation et le développement durable</li>
                </ul>
                
                <div style='background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h4>💚 L'impact de votre don</h4>
                    <p>Grâce à votre générosité, nous pouvons transformer des vies et construire un avenir meilleur pour notre communauté au Bénin.</p>
                </div>
                
                <p>Nous vous tiendrons informé(e) de l'utilisation de votre don et de l'impact généré.</p>
                
                <p>Avec toute notre reconnaissance,<br>
                <strong>L'équipe OASIS ÉDUCATION ET DÉVELOPPEMENT</strong></p>
            </div>
            
            <div style='background: #333; color: white; padding: 20px; text-align: center;'>
                <p>OASIS ÉDUCATION ET DÉVELOPPEMENT<br>
                Djougou, Donga, Bénin<br>
                Email: contact@oasis-education-dev.org</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'From: OASIS ÉDUCATION ET DÉVELOPPEMENT <contact@oasis-education-dev.org>',
        'Reply-To: contact@oasis-education-dev.org',
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    mail($donation['donor_email'], $subject, $message, implode("\r\n", $headers));
}

/**
 * Envoie une notification à l'admin
 */
function sendAdminNotification($donation) {
    $admin_email = ADMIN_EMAIL;
    $subject = "Nouveau don reçu - " . number_format($donation['amount'], 0, ',', ' ') . " FCFA";
    
    $message = "
    <html>
    <head>
        <title>Nouveau don reçu</title>
    </head>
    <body>
        <h2>Nouveau don reçu</h2>
        <p><strong>Montant :</strong> " . number_format($donation['amount'], 0, ',', ' ') . " FCFA</p>
        <p><strong>Donateur :</strong> " . htmlspecialchars($donation['donor_name']) . "</p>
        <p><strong>Email :</strong> " . htmlspecialchars($donation['donor_email']) . "</p>
        <p><strong>Type :</strong> " . getDonationTypeName($donation['donation_type']) . "</p>
        <p><strong>Fréquence :</strong> " . ($donation['frequency'] === 'monthly' ? 'Don mensuel' : 'Don unique') . "</p>
        <p><strong>Date :</strong> " . date('d/m/Y H:i', strtotime($donation['completed_at'])) . "</p>
    </body>
    </html>
    ";
    
    $headers = [
        'From: OASIS ÉDUCATION ET DÉVELOPPEMENT <noreply@oasis-education-dev.org>',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    mail($admin_email, $subject, $message, implode("\r\n", $headers));
}

/**
 * Envoie un email en cas d'échec de paiement
 */
function sendPaymentFailedEmail($donation) {
    $subject = "Problème avec votre don - OASIS ÉDUCATION ET DÉVELOPPEMENT";
    
    $message = "
    <html>
    <head>
        <title>Problème de paiement</title>
    </head>
    <body>
        <h2>Problème avec votre don</h2>
        <p>Bonjour " . htmlspecialchars($donation['donor_name']) . ",</p>
        <p>Nous avons rencontré un problème lors du traitement de votre don.</p>
        <p>Veuillez réessayer ou nous contacter si le problème persiste.</p>
        <p>Merci pour votre compréhension.</p>
    </body>
    </html>
    ";
    
    $headers = [
        'From: OASIS ÉDUCATION ET DÉVELOPPEMENT <contact@oasis-education-dev.org>',
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    mail($donation['donor_email'], $subject, $message, implode("\r\n", $headers));
}

/**
 * Retourne le nom du type de don
 */
function getDonationTypeName($type) {
    $types = [
        'general' => 'Don général',
        'women' => 'Autonomisation des femmes',
        'children' => 'Protection des enfants',
        'environment' => 'Protection environnementale'
    ];
    
    return $types[$type] ?? 'Don général';
}

// Inclure Stripe PHP SDK
require_once 'vendor/autoload.php';
?>
