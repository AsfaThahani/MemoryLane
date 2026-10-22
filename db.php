<?php
$server_name = "127.0.0.1";
$username = "root";
$password = "";
$database_name = "memorylane";
$port = 3307;

$conn = new mysqli($server_name, $username, $password, $database_name, $port);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
