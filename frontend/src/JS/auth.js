const API_URL = "http://localhost:8080/api";

const loginForm = document.getElementById("login-form");
const registroForm = document.getElementById("form-registro");
const recuperarForm = document.getElementById("form-recuperar");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "error") {
    mensaje.textContent = texto;

    if (tipo === "error") {
        mensaje.style.color = "#ffb3b3";
    } else {
        mensaje.style.color = "#b6ffb3";
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        mostrarMensaje("Debes ingresar usuario y contraseña.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarMensaje(data.message || "Error al iniciar sesión.");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        mostrarMensaje("Inicio de sesión correcto.", "ok");

        setTimeout(() => {
            window.location.href = "/html/home.html";
        }, 700);

    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el backend.");
    }
});

registroForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const username = document.getElementById("username2").value.trim();
    const email = document.getElementById("email2").value.trim();
    const password = document.getElementById("password2").value.trim();
    const confirmarPassword = document.getElementById("password3").value.trim();

    if (!nombre || !username || !email || !password || !confirmarPassword) {
        mostrarMensaje("Debes completar todos los campos.");
        return;
    }

    if (password !== confirmarPassword) {
        mostrarMensaje("Las contraseñas no coinciden.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.validationErrors) {
                const errores = Object.values(data.validationErrors).join(" ");
                mostrarMensaje(errores);
            } else {
                mostrarMensaje(data.message || "Error al crear la cuenta.");
            }
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        mostrarMensaje("Cuenta creada correctamente.", "ok");

        setTimeout(() => {
            window.location.href = "/html/home.html";
        }, 700);

    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el backend.");
    }
});

recuperarForm.addEventListener("submit", function (event) {
    event.preventDefault();
    mostrarMensaje("Recuperación de contraseña aún no implementada.", "error");
});