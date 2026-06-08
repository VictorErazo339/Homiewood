const API_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080/api"
        : "https://homiewood-p3p5.onrender.com/api";

const loginForm = document.getElementById("login-form");
const registroForm = document.getElementById("form-registro");
const recuperarForm = document.getElementById("form-recuperar");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "error") {
    if (!mensaje) return;

    mensaje.textContent = texto;

    if (tipo === "error") {
        mensaje.style.color = "#ffb3b3";
    } else if (tipo === "ok") {
        mensaje.style.color = "#b6ffb3";
    } else {
        mensaje.style.color = "#ffd98a";
    }
}

function normalizarUsername(username) {
    return String(username || "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase();
}

function bloquearFormulario(form, bloqueado, textoBoton = null) {
    if (!form) return;

    const inputs = form.querySelectorAll("input, button, a");

    inputs.forEach(elemento => {
        if (elemento.tagName === "A") {
            elemento.style.pointerEvents = bloqueado ? "none" : "auto";
            elemento.style.opacity = bloqueado ? "0.6" : "1";
        } else {
            elemento.disabled = bloqueado;
        }
    });

    const botonSubmit = form.querySelector('button[type="submit"]');

    if (botonSubmit) {
        if (!botonSubmit.dataset.originalText) {
            botonSubmit.dataset.originalText = botonSubmit.textContent;
        }

        botonSubmit.textContent = bloqueado
            ? textoBoton || "Procesando..."
            : botonSubmit.dataset.originalText;
    }
}

async function requestConTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        const contentType = response.headers.get("content-type");

        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw data;
        }

        return data;
    } finally {
        clearTimeout(timeoutId);
    }
}

function guardarSesion(data) {
    if (!data || !data.token || !data.usuario) {
        throw new Error("Respuesta de autenticación incompleta.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = normalizarUsername(document.getElementById("username")?.value);
        const password = document.getElementById("password")?.value.trim();

        if (!username || !password) {
            mostrarMensaje("Debes ingresar usuario y contraseña.");
            return;
        }

        bloquearFormulario(loginForm, true, "Iniciando...");

        try {
            mostrarMensaje("Validando credenciales...", "info");

            const data = await requestConTimeout(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            guardarSesion(data);

            mostrarMensaje("Inicio de sesión correcto.", "ok");

            window.location.href = "./home.html";
        } catch (error) {
            console.error("Error login:", error);

            if (error?.name === "AbortError") {
                mostrarMensaje("El servidor demoró demasiado en responder. Intenta nuevamente.");
                return;
            }

            mostrarMensaje(
                error?.message ||
                error?.error ||
                "Usuario o contraseña incorrectos."
            );
        } finally {
            bloquearFormulario(loginForm, false);
        }
    });
}

if (registroForm) {
    registroForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre")?.value.trim();
        const username = normalizarUsername(document.getElementById("username2")?.value);
        const email = document.getElementById("email2")?.value.trim().toLowerCase();
        const password = document.getElementById("password2")?.value.trim();
        const confirmarPassword = document.getElementById("password3")?.value.trim();

        if (!nombre || !username || !email || !password || !confirmarPassword) {
            mostrarMensaje("Debes completar todos los campos.");
            return;
        }

        if (username.length < 3 || username.length > 50) {
            mostrarMensaje("El username debe tener entre 3 y 50 caracteres.");
            return;
        }

        if (password.length < 6) {
            mostrarMensaje("La contraseña debe tener mínimo 6 caracteres.");
            return;
        }

        if (password !== confirmarPassword) {
            mostrarMensaje("Las contraseñas no coinciden.");
            return;
        }

        bloquearFormulario(registroForm, true, "Creando...");

        try {
            mostrarMensaje("Creando cuenta...", "info");

            const data = await requestConTimeout(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    username,
                    email,
                    password
                })
            });

            guardarSesion(data);

            mostrarMensaje("Cuenta creada correctamente.", "ok");

            window.location.href = "./home.html";
        } catch (error) {
            console.error("Error registro:", error);

            if (error?.name === "AbortError") {
                mostrarMensaje("El servidor demoró demasiado en responder. Intenta nuevamente.");
                return;
            }

            if (error?.validationErrors) {
                const errores = Object.values(error.validationErrors).join(" ");
                mostrarMensaje(errores);
                return;
            }

            mostrarMensaje(
                error?.message ||
                error?.error ||
                "Error al crear la cuenta."
            );
        } finally {
            bloquearFormulario(registroForm, false);
        }
    });
}

if (recuperarForm) {
    recuperarForm.addEventListener("submit", function (event) {
        event.preventDefault();
        mostrarMensaje("Recuperación de contraseña aún no implementada.", "error");
    });
}