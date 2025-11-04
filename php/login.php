<?php
// CORS & JSON headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Respond to preflight and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;

// Read raw JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);


$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Guard: missing credentials
if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
    exit;
}

try {
    // Connect to local MongoDB (adjust URI if needed)
    $client = new Client("mongodb://localhost:27017");
    $collection = $client->OrganizationManagementDatabase->users;

    // Find user by email
    $user = $collection->findOne(['email' => $email]);

    if ($user) {
        // If using plaintext passwords (testing only)
        if (isset($user['password']) && $user['password'] === $password) {
            echo json_encode(["success" => true, "role" => $user['role']]);
            exit;
        }

        // If passwords were hashed with password_hash() (recommended), use:
        // if (isset($user['password']) && password_verify($password, $user['password'])) { ... }

        // password mismatch
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    } else {
        // user not found
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    }
} catch (Throwable $e) {
    // Log error server-side (do not expose sensitive error details to client)
    error_log("Login error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error"]);
    exit;
}
