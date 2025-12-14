<?php
ini_set('session.cookie_lifetime', 0);
session_start();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    "http://localhost:8123",
    "http://192.168.0.111:8123"
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
// Session timeout check (3 minutes of inactivity)
$timeout = 360; 

if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout) {
    echo json_encode([
        "loggedIn" => false,
        "user" => null,
        "error" => "Session expired due to inactivity"
    ]);
    
    session_unset();
    session_destroy();

    exit;
}

// Update last activity timestamp
$_SESSION['last_activity'] = time();

// Regular login check
$loggedIn = isset($_SESSION['loggedIn']) && $_SESSION['loggedIn'] === true;
$user = $_SESSION['user'] ?? null;

if (!$loggedIn || ($user['role'] ?? '') !== 'OSA') {
    echo json_encode([
        "loggedIn" => false,
        "user" => null
    ]);
    exit;
}

echo json_encode([
    "loggedIn" => true,
    "user" => $user
]);
