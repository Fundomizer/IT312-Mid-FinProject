<?php
ini_set('session.cookie_lifetime', 0);
session_start();
header("Content-Type: application/json");

$timeout = 180; 

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
