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
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? '';
if (!$email) {
    echo json_encode(["success" => false, "error" => "Missing email"]);
    exit;
}
// Set session variables
$_SESSION['last_activity'] = time();
$_SESSION['loggedIn'] = true;

$_SESSION['user'] = [
    "email" => $email,
    "role" => "OSA"
];
 

error_log("Session started for OSA: " . print_r($_SESSION['user'], true));
echo json_encode(["success" => true]);
?>