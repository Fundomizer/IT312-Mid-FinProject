<?php
ini_set('session.cookie_lifetime', 0); 
session_start();

header("Access-Control-Allow-Origin: http://localhost:8123");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? '';
// Simple session start for OSA role
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
console.log("Session started for OSA:", $_SESSION['user']);
echo json_encode(["success" => true]);
?>