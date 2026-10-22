<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$server_name = "localhost";
$username = "root";
$password = "";
$database_name = "memorylane";
$port = 3307;   // ← add this

$conn = mysqli_connect($server_name, $username, $password, $database_name, $port);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql_query = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $sql_query->bind_param("s", $email);
    $sql_query->execute();
    $result = $sql_query->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id']; 
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $user['email'];

            echo "<script>
                    alert('Login successful! Welcome, {$user['username']}');
                    window.location.href = 'canvas.php';
                  </script>";
            exit();
        } else {
            echo "<script>
                    alert('Invalid password. Please try again.');
                    window.location.href = 'index.html';
                  </script>";
            exit();
        }
    } else {
        echo "<script>
                alert('No user found with that email address.');
                window.location.href = 'index.html';
              </script>";
        exit();
    }

    if (isset($_GET['signup']) && $_GET['signup'] == 'success') {
        echo "<script>
                alert('Account created successfully! Please log in.');
                window.location.href = 'index.html';
              </script>";
        exit();
    }
}

$sql_query->close();
mysqli_close($conn);
?>
