<?php
// ===== CONFIGURATION FILE FOR OASIS ÉDUCATION ET DÉVELOPPEMENT =====

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'oasis_education_dev');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Site configuration
define('SITE_NAME', 'OASIS ÉDUCATION ET DÉVELOPPEMENT');
define('SITE_EMAIL', 'contact@oasis-education-dev.org');
define('SITE_PHONE', '+229 XX XX XX XX');
define('SITE_ADDRESS', 'Djougou, Donga, Bénin');

// Email configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_ENCRYPTION', 'tls');

// Security settings
define('ENCRYPTION_KEY', 'your-secret-encryption-key-here');
define('JWT_SECRET', 'your-jwt-secret-key-here');

// File upload settings
define('UPLOAD_PATH', 'uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']);

// Pagination settings
define('ITEMS_PER_PAGE', 10);

// Timezone
date_default_timezone_set('Africa/Porto-Novo');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Database connection function
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Sanitize input function
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Validate email function
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Validate phone function
function validatePhone($phone) {
    return preg_match('/^[\+]?[0-9\s\-\(\)]{8,}$/', $phone);
}

// Generate CSRF token
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Verify CSRF token
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Send email function
function sendEmail($to, $subject, $message, $isHTML = true) {
    try {
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: ' . ($isHTML ? 'text/html' : 'text/plain') . '; charset=UTF-8';
        $headers[] = 'From: ' . SITE_NAME . ' <' . SITE_EMAIL . '>';
        $headers[] = 'Reply-To: ' . SITE_EMAIL;
        $headers[] = 'X-Mailer: PHP/' . phpversion();
        
        return mail($to, $subject, $message, implode("\r\n", $headers));
    } catch (Exception $e) {
        error_log("Email sending failed: " . $e->getMessage());
        return false;
    }
}

// Upload file function
function uploadFile($file, $directory = 'general') {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'message' => 'Invalid file upload.'];
    }
    
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            return ['success' => false, 'message' => 'No file uploaded.'];
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return ['success' => false, 'message' => 'File too large.'];
        default:
            return ['success' => false, 'message' => 'Unknown upload error.'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'File too large.'];
    }
    
    $pathinfo = pathinfo($file['name']);
    $extension = strtolower($pathinfo['extension']);
    
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        return ['success' => false, 'message' => 'File type not allowed.'];
    }
    
    $uploadDir = UPLOAD_PATH . $directory . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'filepath' => $filepath, 'filename' => $filename];
    } else {
        return ['success' => false, 'message' => 'Failed to move uploaded file.'];
    }
}

// Log activity function
function logActivity($action, $details = '', $user_id = null) {
    try {
        $pdo = getDBConnection();
        if (!$pdo) return false;
        
        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (action, details, user_id, ip_address, user_agent, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        return $stmt->execute([
            $action,
            $details,
            $user_id,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $e) {
        error_log("Activity logging failed: " . $e->getMessage());
        return false;
    }
}

// Response helper functions
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function successResponse($message, $data = []) {
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
}

function errorResponse($message, $status = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message
    ], $status);
}

// Rate limiting function
function checkRateLimit($action, $limit = 5, $window = 300) { // 5 requests per 5 minutes
    $key = $action . '_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    
    if (!isset($_SESSION['rate_limits'])) {
        $_SESSION['rate_limits'] = [];
    }
    
    $now = time();
    
    if (!isset($_SESSION['rate_limits'][$key])) {
        $_SESSION['rate_limits'][$key] = ['count' => 1, 'window_start' => $now];
        return true;
    }
    
    $rateLimit = &$_SESSION['rate_limits'][$key];
    
    // Reset window if expired
    if ($now - $rateLimit['window_start'] > $window) {
        $rateLimit = ['count' => 1, 'window_start' => $now];
        return true;
    }
    
    // Check limit
    if ($rateLimit['count'] >= $limit) {
        return false;
    }
    
    $rateLimit['count']++;
    return true;
}

// Security headers
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src \'self\' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src \'self\' data: https:;');
}

// Set security headers
setSecurityHeaders();
?>
