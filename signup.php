<?php 
session_start();
$server_name = "localhost";
$username = "root";
$password = "";
$database_name = "memorylane";

$conn = mysqli_connect($server_name, $username, $password, $database_name);

if (!$conn) {
    die("Connection Failed: " . mysqli_connect_error());
}

if (isset($_POST['save'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    if ($password !== $confirm_password) {
        echo "<script>
                alert('Passwords do not match!');
                window.history.back();
              </script>";
        exit();
    }

    $sql_query = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $sql_query->bind_param("s", $email);
    $sql_query->execute();
    $sql_query->store_result();

    if ($sql_query->num_rows > 0) {
        echo "<script>
                alert('Email is already in use!');
                window.history.back();
              </script>";
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $insert_query = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $insert_query->bind_param("sss", $username, $email, $hashed_password);

        if ($insert_query->execute()) {
            $_SESSION['user_id']  = $insert_query->insert_id;
            $_SESSION['username'] = $username;
            $_SESSION['email']    = $email;

            $welcome = urlencode($username);
            echo "<script>
                    window.location.href = 'canvas.php?welcome=" . $welcome . "';
                  </script>";
            exit();
        } else {
            echo "<script>
                    alert('Error: " . $insert_query->error . "');
                    window.history.back();
                  </script>";
        }

        $insert_query->close();
    }

    $sql_query->close();
}

mysqli_close($conn);
?>