<?php
ini_set('session.cookie_lifetime', 0); 
session_start();

header("Access-Control-Allow-Origin: http://localhost:8123");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? '';

if (!$email) {
    echo json_encode(["success" => false, "error" => "Missing email"]);
    exit;
}

$_SESSION['loggedIn'] = true;
$_SESSION['user'] = [
    "email" => $email,
    "role" => "OSA"
];

echo json_encode(["success" => true]);
?>