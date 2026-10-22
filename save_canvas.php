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


$user_id = $_SESSION['user_id']; 

$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'];
$image_data = $data['data'];


$stmt = $conn->prepare("INSERT INTO canvas_pages (user_id, title, image_path) VALUES (?, ?, ?)");
$image_path = saveImage($image_data);
$stmt->bind_param("iss", $user_id, $title, $image_path);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Page saved successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error saving page: ' . $stmt->error]);
}


function saveImage($data) {
    $image = str_replace('data:image/png;base64,', '', $data);
    $image = str_replace(' ', '+', $image);
    $image_name = uniqid() . '.png'; 
    $file_path = 'uploads/' . $image_name;
    file_put_contents($file_path, base64_decode($image));
    return $file_path;
}

$stmt->close();
$conn->close();
?>
