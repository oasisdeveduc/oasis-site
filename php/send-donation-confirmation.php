<?php
/**
 * Envoi d'email de confirmation de don
 */

require_once 'config.php';

// Headers pour la réponse JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Vérifier que la requête est en POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

try {
    // Récupérer les données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Données JSON invalides');
    }
    
    // Envoyer l'email de confirmation
    $result = sendConfirmationEmail($input);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Email envoyé avec succès']);
    } else {
        throw new Exception('Erreur lors de l\'envoi de l\'email');
    }
    
} catch (Exception $e) {
    error_log('Erreur send-donation-confirmation: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Envoie l'email de confirmation
 */
function sendConfirmationEmail($donationData) {
    $donor_name = $donationData['donor_name'] ?? '';
    $donor_email = $donationData['donor_email'] ?? '';
    $amount = $donationData['amount'] ?? 0;
    $donation_type = $donationData['donation_type'] ?? 'general';
    $frequency = $donationData['frequency'] ?? 'one-time';
    $payment_intent_id = $donationData['payment_intent_id'] ?? '';
    
    if (empty($donor_email)) {
        return false;
    }
    
    $subject = "Confirmation de votre don - OASIS ÉDUCATION ET DÉVELOPPEMENT";
    
    $message = generateConfirmationEmailHTML($donationData);
    
    $headers = [
        'From: OASIS ÉDUCATION ET DÉVELOPPEMENT <contact@oasis-education-dev.org>',
        'Reply-To: contact@oasis-education-dev.org',
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($donor_email, $subject, $message, implode("\r\n", $headers));
}

/**
 * Génère le HTML de l'email de confirmation
 */
function generateConfirmationEmailHTML($donationData) {
    $donor_name = $donationData['donor_name'] ?? '';
    $amount = $donationData['amount'] ?? 0;
    $donation_type = $donationData['donation_type'] ?? 'general';
    $frequency = $donationData['frequency'] ?? 'one-time';
    $payment_intent_id = $donationData['payment_intent_id'] ?? '';
    
    $formatted_amount = number_format($amount, 0, ',', ' ') . ' FCFA';
    $donation_type_name = getDonationTypeName($donation_type);
    $frequency_name = $frequency === 'monthly' ? 'Don mensuel' : 'Don unique';
    $current_date = date('d/m/Y H:i');
    
    return "
    <!DOCTYPE html>
    <html lang='fr'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Confirmation de don</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #2E8B57, #1E90FF);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 2rem;
                font-weight: 700;
            }
            .header h2 {
                margin: 10px 0 0 0;
                font-size: 1.3rem;
                opacity: 0.9;
                font-weight: 400;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 1.1rem;
                margin-bottom: 20px;
            }
            .thank-you {
                background: #e8f5e8;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2E8B57;
            }
            .donation-details {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .donation-details h3 {
                color: #2E8B57;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #555;
            }
            .detail-value {
                color: #333;
            }
            .impact-section {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .impact-section h3 {
                color: #2E8B57;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .impact-list {
                list-style: none;
                padding: 0;
            }
            .impact-list li {
                padding: 8px 0;
                position: relative;
                padding-left: 25px;
            }
            .impact-list li:before {
                content: '✅';
                position: absolute;
                left: 0;
            }
            .next-steps {
                background: #fff3cd;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                border-left: 4px solid #ffc107;
            }
            .next-steps h3 {
                color: #856404;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .next-steps ul {
                margin: 0;
                padding-left: 20px;
            }
            .next-steps li {
                margin-bottom: 8px;
            }
            .footer {
                background: #333;
                color: white;
                padding: 30px;
                text-align: center;
            }
            .footer p {
                margin: 5px 0;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                color: #2E8B57;
                text-decoration: none;
                margin: 0 10px;
                font-size: 1.2rem;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 0;
                    border-radius: 0;
                }
                .header, .content, .footer {
                    padding: 20px;
                }
                .header h1 {
                    font-size: 1.5rem;
                }
                .header h2 {
                    font-size: 1.1rem;
                }
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🌍 OASIS ÉDUCATION ET DÉVELOPPEMENT</h1>
                <h2>Merci pour votre générosité !</h2>
            </div>
            
            <div class='content'>
                <div class='greeting'>
                    <p>Bonjour <strong>" . htmlspecialchars($donor_name) . "</strong>,</p>
                    <p>Nous vous remercions chaleureusement pour votre don de <strong>" . $formatted_amount . "</strong>.</p>
                </div>
                
                <div class='thank-you'>
                    <p><strong>Votre générosité fait la différence !</strong></p>
                    <p>Grâce à votre contribution, nous pouvons continuer nos actions pour l'éducation, la dignité et le développement durable au Bénin.</p>
                </div>
                
                <div class='donation-details'>
                    <h3>📋 Détails de votre don</h3>
                    <div class='detail-item'>
                        <span class='detail-label'>Montant :</span>
                        <span class='detail-value'><strong>" . $formatted_amount . "</strong></span>
                    </div>
                    <div class='detail-item'>
                        <span class='detail-label'>Type :</span>
                        <span class='detail-value'>" . $donation_type_name . "</span>
                    </div>
                    <div class='detail-item'>
                        <span class='detail-label'>Fréquence :</span>
                        <span class='detail-value'>" . $frequency_name . "</span>
                    </div>
                    <div class='detail-item'>
                        <span class='detail-label'>Date :</span>
                        <span class='detail-value'>" . $current_date . "</span>
                    </div>
                    <div class='detail-item'>
                        <span class='detail-label'>Statut :</span>
                        <span class='detail-value'><strong style='color: #28a745;'>✅ Confirmé</strong></span>
                    </div>
                    " . ($payment_intent_id ? "
                    <div class='detail-item'>
                        <span class='detail-label'>Référence :</span>
                        <span class='detail-value'>" . substr($payment_intent_id, -8) . "</span>
                    </div>" : "") . "
                </div>
                
                <div class='impact-section'>
                    <h3>💚 L'impact de votre don</h3>
                    <p>Votre contribution nous permet de continuer nos actions pour :</p>
                    <ul class='impact-list'>
                        <li>L'autonomisation des femmes par la formation et les activités génératrices de revenus</li>
                        <li>La protection des enfants orphelins et personnes vulnérables</li>
                        <li>La lutte contre les violences basées sur le genre</li>
                        <li>La protection de l'environnement et la reforestation</li>
                        <li>L'éducation et la formation professionnelle</li>
                        <li>La création de centres sociaux et culturels</li>
                    </ul>
                </div>
                
                <div class='next-steps'>
                    <h3>📬 Prochaines étapes</h3>
                    <ul>
                        <li>Vous recevrez un reçu fiscal par email dans les 24 heures</li>
                        <li>Nous vous tiendrons informé(e) de l'utilisation de votre don</li>
                        <li>Vous recevrez des rapports d'impact réguliers</li>
                        " . ($frequency === 'monthly' ? "<li>Votre don mensuel sera automatiquement renouvelé</li>" : "") . "
                    </ul>
                </div>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <p style='font-size: 1.1rem; color: #2E8B57; font-weight: 600;'>
                        Avec toute notre reconnaissance,<br>
                        <strong>L'équipe OASIS ÉDUCATION ET DÉVELOPPEMENT</strong>
                    </p>
                </div>
                
                <div class='social-links' style='text-align: center;'>
                    <p>Suivez-nous pour voir l'impact de votre don :</p>
                    <a href='#'>📘 Facebook</a>
                    <a href='#'>📷 Instagram</a>
                    <a href='#'>💼 LinkedIn</a>
                    <a href='#'>🐦 Twitter</a>
                </div>
            </div>
            
            <div class='footer'>
                <p><strong>OASIS ÉDUCATION ET DÉVELOPPEMENT</strong></p>
                <p>Organisation Non Gouvernementale</p>
                <p>Djougou, Donga, République du Bénin</p>
                <p>📧 contact@oasis-education-dev.org</p>
                <p>🌐 www.oasis-education-dev.org</p>
                <p style='margin-top: 20px; font-size: 0.9rem; opacity: 0.8;'>
                    Cet email a été envoyé automatiquement suite à votre don. 
                    Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter.
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
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
?>
