<?php
session_start();
header("Content-Type: application/json");

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
