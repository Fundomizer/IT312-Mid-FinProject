<?php
require '../vendor/autoload.php';
/*
How to access endpoints:
With this script you can access the endpoints and get the JSON data via:
- http://<server>/<project>/<phpfile>.php?collection=<collection_name>
- Example: http://localhost/MongoDB/api.php?collection=users
You can just plug that URL in the fetch to get the JSON data from the endpoint

NOTE: The collection can be any string from the $collections variable

This is hosted in a wamp server when this script was written (03/11/2025).
*/


// ----- CORS headers -----
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // MongoDB connection
    $uri = "mongodb://localhost:27017/";
    $client = new MongoDB\Client($uri);
    $db = $client->DMS;

    // --- Allowed collections ---
    $collections = [
        'forms',
        'history',
        'log',
        'org_forms',
        'osa_submissions',
        'student_organizations',
        'users'
    ];

    // --- Get collection from query string ---
    $collectionName = $_GET['collection'] ?? null;

    if ($collectionName && in_array($collectionName, $collections)) {
        $collection = $db->$collectionName;

        // Fetch all documents
        $cursor = $collection->find();

        // Convert cursor to array
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
