<?php
session_start();
header("Content-Type: application/json");

require __DIR__ . '/vendor/autoload.php';
use MongoDB\Client;

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

if (!$email || !$password) {
    echo json_encode(["success" => false, "error" => "Missing credentials"]);
    exit;
}

try {
    $client = new Client("mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/");
    $collection = $client->OrganizationManagementDatabase->users;

    $user = $collection->findOne(["email" => $email]);

    if (!$user || $user["password"] !== $password) {
        echo json_encode(["success" => false, "error" => "Invalid credentials"]);
        exit;
    }

    $oldSessionId = $user['current_session_id'] ?? null;
    if ($oldSessionId && $oldSessionId !== session_id()) {
        session_write_close();
        $oldSessionFile = session_save_path() . "/sess_$oldSessionId";
        if (file_exists($oldSessionFile)) unlink($oldSessionFile);
        session_start();
    }

    $_SESSION["loggedIn"] = true;
    $_SESSION["user"] = [
        "email" => $user["email"],
        "role" => $user["role"],
        "_id" => (string)$user["_id"]
    ];

    $collection->updateOne(
        ['_id' => $user['_id']],
        ['$set' => ['current_session_id' => session_id()]]
    );

    echo json_encode([
        "success" => true,
        "role" => $user["role"]
    ]);

} catch (Throwable $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "Server error"]);
}
?>
