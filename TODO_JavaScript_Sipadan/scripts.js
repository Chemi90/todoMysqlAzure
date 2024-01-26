let currentUser = null;


// Función para mostrar el formulario de login
function showLogin() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "none";
}

// Función para mostrar el formulario de registro
function showRegister() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
    document.getElementById("tasks-section").style.display = "none";
}

// Función para mostrar la app de tareas
function showTasks() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "block";
    updateUserNameDisplay();
    displayTasks();
}

// Este bloque se ejecuta cuando el contenido del DOM está completamente cargado.
// Añade un listener al checkbox de mostrar tareas completadas para actualizar la lista de tareas.
// Llama a restoreState para restaurar la sección que estaba siendo visualizada antes de recargar.
// Si hay un usuario logueado, muestra sus tareas.
// Añade un listener para restaurar el estado cuando se carga el contenido del DOM.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('show-completed').addEventListener('change', displayTasks);
    document.addEventListener('DOMContentLoaded', restoreState);
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserNameDisplay();
        displayTasks();
        showTasks();
    } else {
        showLogin();
    }
    const currentView = sessionStorage.getItem('currentView');
    if (currentView) {
        changeView(currentView);
    }
    restoreState();
    // Aquí añades los event listeners para los botones o enlaces
});

// Esta función maneja el registro de nuevos usuarios.
// Obtiene los valores de los campos del formulario de registro.
// Realiza varias validaciones: espacios en el nombre, usuario y contraseña.
// Comprueba si el usuario ya existe en localStorage.
// Si no existe, lo agrega y muestra la pantalla de login.
function registerUser() {
    let name = document.getElementById('name').value;
    let username = document.getElementById('new-username').value;
    let password = document.getElementById('new-password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    // Validar que el nombre no tenga espacios al principio o al final
    if (name.trim() !== name) {
        alert('El nombre no debe tener espacios al principio o al final.');
        return;
    }

    // Validar que el usuario y la contraseña no tengan espacios
    if (username.includes(' ') || password.includes(' ')) {
        alert('El usuario y la contraseña no deben contener espacios.');
        return;
    }

    // Verificar si las claves coinciden
    if (password !== confirmPassword) {
        alert('Las claves no coinciden.');
        return;
    }

    // Construir el objeto JSON con los datos del usuario
    let userData = {
        nombre: name,
        usuario: username,
        clave: password
    };

    // Realizar la solicitud POST al script PHP
    fetch('../API/login.POST.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Usuario registrado exitosamente.');
            // Vaciar los campos del formulario de registro
            document.getElementById('name').value = '';
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            // Cambiar a la pantalla de login
            showLogin();

            // Rellenar el campo de usuario y poner el foco en el campo de contraseña
            document.getElementById('username').value = username;
            document.getElementById('password').focus();
        } else {
            alert('Error al registrar el usuario: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al registrar el usuario:', error);
    });
}


// Maneja el proceso de inicio de sesión.
// Obtiene el nombre de usuario y contraseña introducidos.
// Verifica si coinciden con algún usuario registrado en localStorage.
// Si es correcto, guarda este usuario como 'loggedInUser' y muestra la sección de tareas.
function loginUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    fetch('../API/login.GET.usuario.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usuario: username,
            clave: password
        })
    })
    .then(response => response.json())
    .then(json => {
        console.log(json); // Depuración: Imprimir respuesta del servidor

        if (json.success) {
            currentUser = {
                id_usuario: json.data.id_usuario,
                nombre: json.data.nombre,
            };
            sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            updateUserNameDisplay();  // Actualiza el nombre del usuario
            displayTasks(); // Carga las tareas del usuario logueado
            showTasks();
        } else {
            alert('Usuario o contraseña incorrecta.');
        }
    })
    .catch(error => {
        console.error('Error al intentar iniciar sesión:', error);
    });
}

function logout() {
    // Limpiar sessionStorage
    sessionStorage.removeItem('loggedInUser');
    
    // Restablecer el estado de la aplicación
    currentUser = null;
    document.getElementById('taskList').innerHTML = '';
    showLogin();
}

function updateUserNameDisplay() {
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.nombre;
    }
}

function changeView(viewName) {
    // Cambia la vista aquí...
    showView(viewName);

    // Guarda la vista actual en sessionStorage
    sessionStorage.setItem('currentView', viewName);
}

// Añade una nueva tarea.
// Verifica si hay un usuario logueado y si el nombre de la tarea no está vacío.
// Crea un objeto de tarea y lo añade a la lista de tareas del usuario en localStorage.
// Luego actualiza la lista de tareas en el DOM.
function addTask() {
    let taskName = document.getElementById('taskName').value.trim();
    if (!taskName) {
        alert('Por favor, ingresa el nombre de la tarea.');
        return;
    }

    if (!currentUser || !currentUser.id_usuario) {
        alert('No hay usuario logueado o falta información del usuario.');
        return;
    }

    // Preparar el objeto de la tarea
    let task = {
        nombre: taskName
    };

    // Hacer una solicitud POST a tu API para guardar la tarea
    fetch('../API/tareas.POST.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_usuario: currentUser.id_usuario,
            nombre: task.nombre
        })
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Tarea agregada correctamente');
            displayTasks(); // Actualizar la lista de tareas
        } else {
            alert('Error al agregar la tarea: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al agregar la tarea:', error);
    });

    // Limpiar el campo de entrada
    document.getElementById('taskName').value = '';
}

// Muestra las tareas del usuario logueado.
// Comprueba si hay tareas completadas y si deben mostrarse según el estado del checkbox.
// Crea elementos del DOM para cada tarea y los añade a la lista de tareas en la página.
function displayTasks() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        console.log("No hay usuario logueado.");
        return;
    }

    let showCompleted = document.getElementById('show-completed').checked;

    fetch('../API/tareas.GET.php?id_usuario=' + loggedInUser.id_usuario)
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            let taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; 

            json.data.forEach(task => {
                // Mostrar solo si la tarea no está completada o si el checkbox está marcado
                if (!task.completada || showCompleted) {
                    let taskElement = document.createElement('div');
                    taskElement.classList.add('task-item');
                    
                    // Añadir nombre de la tarea
                    let taskName = document.createElement('span');
                    taskName.textContent = task.nombre;
                    taskElement.appendChild(taskName);
            
                    // Añadir botón de completar si la tarea no está completada
                    if (!task.completada) {
                        let completeButton = document.createElement('button');
                        completeButton.textContent = 'Completar';
                        completeButton.onclick = function() {
                            completeTask(task.id_tarea);
                        };
                        taskElement.appendChild(completeButton);
                    }
            
                    // Añadir botón de eliminar
                    let deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.onclick = function() {
                        deleteTask(task.id_tarea);
                    };
                    taskElement.appendChild(deleteButton);
            
                    // Añadir el elemento de tarea a taskList
                    taskList.appendChild(taskElement);
                }
            });

            updateTaskCounters(json.data);
        } else {
            console.error('Error al obtener las tareas:', json.error);
        }
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
    });
}

function completeTask(taskId, isCompleted) {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('No hay usuario logueado.');
        return;
    }

    // Verificar que tenemos un id_usuario válido
    if (!loggedInUser.id_usuario) {
        console.error('Error: id_usuario no está definido.');
        return;
    }

    // Verificar que tenemos un id_tarea válido
    if (!taskId) {
        console.error('Error: id_tarea no está definido.');
        return;
    }

    // Construir la URL con parámetros GET
    let url = `../API/tareas.PUT.php?id_usuario=${loggedInUser.id_usuario}&id_tarea=${taskId}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            completada: true
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Respuesta de red no fue ok');
        }
        return response.json();
    })
    .then(json => {
        if (json.success) {
            alert('Estado de la tarea actualizado correctamente.');
            displayTasks(); // Actualizar la lista de tareas
        } else {
            alert('Error al actualizar el estado de la tarea: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al actualizar el estado de la tarea:', error);
    });
}

function deleteTask(taskId) {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('No hay usuario logueado.');
        return;
    }

    // Confirmar antes de eliminar
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return;
    }

    // Cambio a solicitud GET y añadir id_tarea en la URL
    fetch('../API/tareas.DELETE.php?id_tarea=' + taskId, {
        method: 'GET' // Usar método GET
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Tarea eliminada correctamente');
            // Volver a cargar la lista de tareas
            displayTasks(); 
        } else {
            alert('Error al eliminar la tarea: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al eliminar la tarea:', error);
    });
}

// Actualiza los contadores de tareas completadas y pendientes en la interfaz de usuario.
function updateTaskCounters(tasks) {
    // Contar tareas completadas y pendientes
    let completedTasks = tasks.filter(task => task.completada).length;
    let pendingTasks = tasks.length - completedTasks;

    document.getElementById('completedTasks').textContent = `Completadas: ${completedTasks}`;
    document.getElementById('pendingTasks').textContent = `Pendientes: ${pendingTasks}`;
}


// Restaura la sección visualizada antes de recargar la página.
// Lee la sección actual de localStorage y muestra la sección correspondiente.
function restoreState() {
    console.log("Restaurando estado...");
    const currentSection = localStorage.getItem('currentSection');
    console.log("Sección actual: ", currentSection);

    switch (currentSection) {
        case 'register':
            console.log("Mostrando sección de registro");
            showRegister();
            break;
        case 'tasks':
            console.log("Mostrando sección de tareas");
            if (localStorage.getItem('loggedInUser')) {
                showTasks();
            } else {
                showLogin();
            }
            break;
        case 'login':
        default:
            console.log("Mostrando sección de login");
            showLogin();
    }
    // Si el usuario está logueado y la sección actual es 'tasks', actualiza los contadores de tareas.
    if (currentUser && currentSection === 'tasks') {
        displayTasks();
    }
}

