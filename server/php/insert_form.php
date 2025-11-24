<?php
require './vendor/autoload.php';

// CORS headers 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

try {
    // Connect to local MongoDB
    $uri = "mongodb://localhost:27017/";
    $client = new MongoDB\Client($uri);
    $db = $client->OrganizationManagementDatabase;
    $collection = $db->forms;

    // Read incoming JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["requirement_name"])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing data"]);
        exit();
    }

    // Insert form data
    $insertResult = $collection->insertOne([
        "requirement_name" => $data["requirement_name"],
        "description" => $data["description"] ?? "",
        "fields" => $data["fields"] ?? [],
    ]);

    echo json_encode([
        "success" => true,
        "inserted_id" => (string) $insertResult->getInsertedId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
