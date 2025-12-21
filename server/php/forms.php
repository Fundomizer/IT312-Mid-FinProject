<?php

session_start();


// Authorization check
if (!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn'] !== true || ($_SESSION['user']['role'] ?? '') !== 'OSA') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}


require './vendor/autoload.php';
header("Access-Control-Allow-Origin: http://localhost:8123");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// MongoDB connection
try {
    $client = new MongoDB\Client("mongodb://localhost:27017/"); // currently using local for easier testing and deletinng
    $db = $client->OrganizationManagementDatabase;
    $collection = $db->forms;


    $data = json_decode(file_get_contents("php://input"), true);

// Handles different request methods
    switch ($_SERVER['REQUEST_METHOD']) {
        //create form 
        case 'POST':
            if (!$data || !isset($data["requirement_name"])) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid or missing data"]);
                exit();
            }


            $insertResult = $collection->insertOne([
                "requirement_name" => $data["requirement_name"],
                "description" => $data["description"] ?? "",
                "fields" => $data["fields"] ?? [],
                "tags" => $data["tags"] ?? [],
                "assigned_to" => $data["assigned_to"] ?? ["all"],
                "upload" => $data["upload"] ?? false

            ]);


            echo json_encode(["success" => true, "inserted_id" => (string)$insertResult->getInsertedId()]);
            break;

//update form by id
case 'PUT':
    $id = $data['_id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing _id"]);
        exit();
    }
    $updateResult = $collection->updateOne(
        ["_id" => new MongoDB\BSON\ObjectId($id)],
        ['$set' => [
            "requirement_name" => $data["requirement_name"] ?? null,
            "description" => $data["description"] ?? null,
            "fields" => $data["fields"] ?? null,
            "tags" => $data["tags"] ?? null,
            "assigned_to" => $data["assigned_to"] ?? ["all"],
            "upload" => $data["upload"] ?? false 

        ]]
    );
    echo json_encode(["success" => true, "modified_count" => $updateResult->getModifiedCount()]);
    break;
//delete form by id
case 'DELETE':
    $id = $data['_id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing _id"]);
        exit();
    }
    $deleteResult = $collection->deleteOne(["_id" => new MongoDB\BSON\ObjectId($id)]);
    echo json_encode(["success" => true, "deleted_count" => $deleteResult->getDeletedCount()]);
    break;



        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
