<?php
ini_set('session.cookie_lifetime', 0);
session_start();
require './vendor/autoload.php';

//CORS headers 
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
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit();
}

// Optional: enforce role-based access
if ($_SESSION['user']['role'] !== 'OSA') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit();
}


try {
    $uri = "mongodb://localhost:27017/"; // change to local if needed
    $client = new MongoDB\Client($uri);
    $db = $client->OrganizationManagementDatabase;

    $collections = ['forms', 'student_organization'];

    $collectionName = $_GET['collection'] ?? null;

    if ($collectionName && in_array($collectionName, $collections)) {
        $collection = $db->$collectionName;

        $cursor = $collection->find();

        $docs = iterator_to_array($cursor);

        // Encode with options to handle BSON types
        echo json_encode($docs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing collection"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
