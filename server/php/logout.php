<?php

session_start();

session_unset();
session_destroy();
setcookie(
    "connect.sid",
    "",
    time() - 3600,
    "/",
    "localhost",
    false,
    true
);
header("Content-Type: application/json");
echo json_encode(["success" => true]);
?>