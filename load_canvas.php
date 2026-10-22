<?php
session_start();

$server_name = "localhost"; 
$username = "root"; 
$password = ""; 
$database_name = "memorylane"; 

$conn = new mysqli($server_name, $username, $password, $database_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, title, image_path FROM canvas_pages WHERE user_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Statement preparation failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$pages = [];
while ($row = $result->fetch_assoc()) {
    $pages[] = $row;
}

echo json_encode(['success' => true, 'pages' => $pages]);

$stmt->close();
$conn->close();
?>
