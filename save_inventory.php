<?php
$servername = "localhost";
$username = "tu_usuario";
$password = "tu_contraseña";
$dbname = "nombre_base_de_datos";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Preparar y enlazar
$stmt = $conn->prepare("UPDATE inventario SET cantidad=?, bodega=?, ubicacion=? WHERE item_id=?");

foreach ($_POST as $key => $value) {
    if (strpos($key, 'quantity_') === 0) {
        $item_id = str_replace('quantity_', '', $key);
        $quantity = $value;
        $warehouse = $_POST["warehouse_$item_id"];
        $location = $_POST["location_$item_id"];

        $stmt->bind_param("issi", $quantity, $warehouse, $location, $item_id);
        $stmt->execute();
    }
}

$stmt->close();
$conn->close();

header('Location: inventario.php');
exit();
?>
