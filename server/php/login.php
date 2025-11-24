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
// Get form fields from POST
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Guard: missing credentials
if (!$email || !$password) {
    echo "Missing credentials";
    exit;
}

try {
    $client = new Client("mongodb://localhost:27017");
    $collection = $client->OrganizationManagementDatabase->users;

    // Find user by email
    $user = $collection->findOne(['email' => $email]);

    if ($user) {
        if (isset($user['password']) && $user['password'] === $password) {

            // Redirect based on role
            switch ($user['role']) {
                case 'admin':
                    header("Location: ../pages/admin/admin_page.html");
                    exit;
                case 'OSA':
                    header("Location: ../pages/osa/osa_page.html");
                    exit;
                case 'Student Organization User':
                    header("Location: ../pages/org/org_page.html");
                    exit;
                default:
                    echo "Unknown role";
                    exit;
            }
        }

        echo "Invalid credentials";
        exit;
    } else {
        echo "Invalid credentials";
        exit;
    }
} catch (Throwable $e) {
    error_log("Login error: " . $e->getMessage());
    echo "Server error";
    exit;
}