<?php
/**
 * Création d'un PaymentIntent Stripe pour les dons
 */

require_once 'config.php';

// Configuration Stripe
$stripe_secret_key = 'sk_test_...'; // Remplacez par votre clé secrète Stripe

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
    
    // Validation des données requises
    $required_fields = ['amount', 'donor_email', 'donor_name'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Le champ $field est requis");
        }
    }
    
    // Validation du montant
    $amount = intval($input['amount']);
    if ($amount < 1000) {
        throw new Exception('Le montant minimum est de 1 000 FCFA');
    }
    
    // Validation de l'email
    if (!filter_var($input['donor_email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Adresse email invalide');
    }
    
    // Initialiser Stripe
    \Stripe\Stripe::setApiKey($stripe_secret_key);
    
    // Créer le customer Stripe (optionnel)
    $customer = \Stripe\Customer::create([
        'email' => $input['donor_email'],
        'name' => $input['donor_name'],
        'metadata' => [
            'donation_type' => $input['donation_type'] ?? 'general',
            'frequency' => $input['frequency'] ?? 'one-time',
            'anonymous' => $input['anonymous'] ?? false
        ]
    ]);
    
    // Créer le PaymentIntent
    $payment_intent_data = [
        'amount' => $amount * 100, // Stripe utilise les centimes
        'currency' => 'xof', // Franc CFA de l'Afrique de l'Ouest
        'customer' => $customer->id,
        'metadata' => [
            'donation_type' => $input['donation_type'] ?? 'general',
            'frequency' => $input['frequency'] ?? 'one-time',
            'anonymous' => $input['anonymous'] ? 'true' : 'false',
            'donor_name' => $input['donor_name'],
            'donor_email' => $input['donor_email'],
            'site' => 'OASIS ÉDUCATION ET DÉVELOPPEMENT'
        ],
        'description' => getDonationDescription($input),
        'receipt_email' => $input['donor_email'],
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
    ];
    
    // Si c'est un don mensuel, créer un setup intent pour les paiements récurrents
    if (($input['frequency'] ?? '') === 'monthly') {
        $payment_intent_data['setup_future_usage'] = 'off_session';
    }
    
    $payment_intent = \Stripe\PaymentIntent::create($payment_intent_data);
    
    // Enregistrer le don dans la base de données (statut "pending")
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        INSERT INTO donations (
            donor_name, 
            donor_email, 
            amount, 
            donation_type, 
            frequency, 
            anonymous, 
            payment_intent_id, 
            status, 
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");
    
    $stmt->execute([
        $input['donor_name'],
        $input['donor_email'],
        $amount,
        $input['donation_type'] ?? 'general',
        $input['frequency'] ?? 'one-time',
        $input['anonymous'] ? 1 : 0,
        $payment_intent->id
    ]);
    
    $donation_id = $pdo->lastInsertId();
    
    // Réponse avec le client_secret
    echo json_encode([
        'success' => true,
        'client_secret' => $payment_intent->client_secret,
        'donation_id' => $donation_id,
        'payment_intent_id' => $payment_intent->id
    ]);
    
} catch (Exception $e) {
    // Log de l'erreur
    error_log('Erreur create-payment-intent: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}

/**
 * Génère une description pour le don
 */
function getDonationDescription($input) {
    $type = $input['donation_type'] ?? 'general';
    $frequency = $input['frequency'] ?? 'one-time';
    
    $descriptions = [
        'general' => 'Don général pour OED',
        'women' => 'Autonomisation des femmes - OED',
        'children' => 'Protection des enfants - OED',
        'environment' => 'Protection environnementale - OED'
    ];
    
    $description = $descriptions[$type] ?? $descriptions['general'];
    
    if ($frequency === 'monthly') {
        $description .= ' (Mensuel)';
    }
    
    return $description;
}

// Inclure Stripe PHP SDK
require_once 'vendor/autoload.php';
?>
