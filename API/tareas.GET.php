<?php
// Cabecera JSON
header('Content-Type: application/json');

// Respuesta por defecto
$respuesta = [
    'success' => false,
    'data' => null,
    'error' => ''
];

// Conexión a la base de datos con mysqli
$host = 'servidorxemi.mysql.database.azure.com'; // Tu servidor de Azure
$username = 'xemita'; // Usuario de Azure
$password = 'Posnose90'; // Contraseña
$dbname = 'todo'; // Nombre de la base de datos
$port = 3306; // Puerto

$con = mysqli_connect($host, $username, $password, $dbname, $port);

// Verificar conexión
if (!$con) {
    $respuesta['error'] = 'No se ha podido conectar con la base de datos: ' . mysqli_connect_error();
    echo json_encode($respuesta);
    exit;
}

// Comprobar si viene el id_usuario como parámetro GET
if (!isset($_GET['id_usuario'])) {
    $respuesta['error'] = 'No se ha recibido el id usuario';
    echo json_encode($respuesta);
    exit;
}

// Acceder a los datos del parámetro GET
$idUsuarioTarea = mysqli_real_escape_string($con, $_GET['id_usuario']);

$sql = "SELECT id_tarea, nombre, completada FROM tarea WHERE id_usuario = ?";

// Preparar y ejecutar la sentencia
if ($stmt = mysqli_prepare($con, $sql)) {
    mysqli_stmt_bind_param($stmt, "i", $idUsuarioTarea);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    // Obtener resultados
    $tareas = mysqli_fetch_all($result, MYSQLI_ASSOC);

    if ($tareas) {
        $respuesta['success'] = true;
        $respuesta['data'] = $tareas;
    } else {
        $respuesta['error'] = 'No se han encontrado tareas';
    }

    // Cerrar la sentencia
    mysqli_stmt_close($stmt);
} else {
    $respuesta['error'] = 'Error al preparar la consulta: ' . mysqli_error($con);
}

// Cerrar la conexión
mysqli_close($con);

echo json_encode($respuesta);
?>
