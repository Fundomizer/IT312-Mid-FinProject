<?php
session_start();

if (!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn'] !== true || ($_SESSION['user']['role'] ?? '') !== 'OSA') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

require './vendor/autoload.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $client = new MongoDB\Client("mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/"); // currently using local for easier testing and deletinng
    $db = $client->OrganizationManagementDatabase;
    $collection = $db->forms;


    $data = json_decode(file_get_contents("php://input"), true);


    switch ($_SERVER['REQUEST_METHOD']) {
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


            ]);


            echo json_encode(["success" => true, "inserted_id" => (string)$insertResult->getInsertedId()]);
            break;


        case 'PUT':
            if (!$data || !isset($data["requirement_name"])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing form name"]);
                exit();
            }


            $name = $data["requirement_name"];
            $updateResult = $collection->updateOne(
                ["requirement_name" => $name],
                ['$set' => [
                    "requirement_name" => $data["requirement_name"] ?? null,
                    "description" => $data["description"] ?? null,
                    "fields" => $data["fields"] ?? null,
                    "tags" => $data["tags"] ?? null,
                    "assigned_to" => $data["assigned_to"] ?? ["all"]
                ]]
            );
            echo json_encode(["success" => true, "modified_count" => $updateResult->getModifiedCount()]);
            break;


        case 'DELETE':
            if (!$data || !isset($data["requirement_name"])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing form ID"]);
                exit();
            }
            $name = $data["requirement_name"];
            $deleteResult = $collection->deleteOne(["requirement_name" => $name]);
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
