<?php
$tz = new DateTimeZone("Asia/Manila");
$now = new DateTime("now", $tz);
require 'vendor/autoload.php';
use MongoDB\Client;

session_start(); 

$client = new Client("mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/"); 
$db = $client->OrganizationManagementDatabase;
$collection = $db->log;

$user = $_SESSION['user']['email'] ?? null;

if (!$user) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$actionMap = [
    1 => 'Login',
    2 => 'Logout',
    3 => 'Create',
    4 => 'Delete',
    5 => 'Update',
    6 => 'Submit'
];

if (isset($data['code'])) {
    $code = intval($data['code']);
    $details = $data['details'] ?? "";
    $activity = $data['activity'] ?? $details;
    $action = $actionMap[$code] ?? "Unknown Action";

    $logEntry = [
        'name' => $user,
        'action' => $action,
        'activity' => $activity,
        'date' => $now->format('Y-m-d'),
        'time' => $now->format('h:i:s A')
    ];

    $collection->insertOne($logEntry);
    echo json_encode(['status'=>'success','message'=>'Log stored in MongoDB']);
} else {
    echo json_encode(['status'=>'error','message'=>'Missing code']);
}
?>
