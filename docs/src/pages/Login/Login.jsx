import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, registrarUsuario } from "../../api/authApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import img from "../../assets/images.js";
import styles from "./Login.module.css";

const SUBTITULOS = {
  login: "Inicia sesión o crea una cuenta",
  registro: "Crea tu cuenta",
  recuperar: "Recupera tu contraseña",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [vista, setVista] = useState("login");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "error" });

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Registro fields
  const [nombre, setNombre] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  // Recuperar fields
  const [recEmail, setRecEmail] = useState("");

  function mostrar(v) {
    setVista(v);
    setMensaje({ texto: "", tipo: "error" });
  }

  function mostrarMensaje(texto, tipo = "error") {
    setMensaje({ texto, tipo });
  }

  async function handleLogin(event) {
    event.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      mostrarMensaje("Debes ingresar usuario y contraseña.");
      return;
    }

    try {
      const data = await apiLogin({ username: u, password: p });
      login(data.token, data.usuario);
      mostrarMensaje("Inicio de sesión correcto.", "ok");
      setTimeout(() => navigate("/home"), 700);
    } catch (error) {
      mostrarMensaje(error?.message || "Error al iniciar sesión.");
    }
  }

  async function handleRegistro(event) {
    event.preventDefault();
    const n = nombre.trim();
    const u = regUsername.trim();
    const em = email.trim();
    const p = regPassword.trim();
    const p2 = regPassword2.trim();

    if (!n || !u || !em || !p || !p2) {
      mostrarMensaje("Debes completar todos los campos.");
      return;
    }

    if (p !== p2) {
      mostrarMensaje("Las contraseñas no coinciden.");
      return;
    }

    try {
      const data = await registrarUsuario({
        nombre: n,
        username: u,
        email: em,
        password: p,
      });
      login(data.token, data.usuario);
      mostrarMensaje("Cuenta creada correctamente.", "ok");
      setTimeout(() => navigate("/home"), 700);
    } catch (error) {
      if (error?.validationErrors) {
        mostrarMensaje(Object.values(error.validationErrors).join(" "));
      } else {
        mostrarMensaje(error?.message || "Error al crear la cuenta.");
      }
    }
  }

  function handleRecuperar(event) {
    event.preventDefault();
    mostrarMensaje("Recuperación de contraseña aún no implementada.", "error");
  }

  return (
    <div className={styles.loginPage}>
      <main className={styles.main}>
        <div className={styles.tarjeta}>
          <h1 className={styles.logoTitulo}>
            <img src={img.hamstersolo} alt="Hamster Homiewood" />
            HOMIEWOOD
          </h1>
          <p>{SUBTITULOS[vista]}</p>

          {vista === "login" && (
            <form onSubmit={handleLogin}>
              <div className={styles.campo}>
                <label htmlFor="username">Usuario:</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Tu username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.btn}>
                Iniciar sesión
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecundario}`}
                onClick={() => mostrar("registro")}
              >
                Crear cuenta
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); mostrar("recuperar"); }}>
                ¿Has olvidado tu contraseña?
              </a>
            </form>
          )}

          {vista === "registro" && (
            <form onSubmit={handleRegistro}>
              <div className={styles.campo}>
                <label htmlFor="nombre">Nombre:</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="username2">Username:</label>
                <input
                  type="text"
                  id="username2"
                  placeholder="Tu nombre de usuario"
                  autoComplete="username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="email2">Email:</label>
                <input
                  type="email"
                  id="email2"
                  placeholder="usuario@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="password2">Contraseña:</label>
                <input
                  type="password"
                  id="password2"
                  placeholder="Tu contraseña"
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="password3">Confirmar contraseña:</label>
                <input
                  type="password"
                  id="password3"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.btn}>
                Crear cuenta
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); mostrar("login"); }}>
                ¿Ya tienes cuenta? Inicia sesión
              </a>
            </form>
          )}

          {vista === "recuperar" && (
            <form onSubmit={handleRecuperar}>
              <div className={styles.campo}>
                <label htmlFor="email3">Email:</label>
                <input
                  type="email"
                  id="email3"
                  placeholder="correo@ejemplo.com"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.btn}>
                Enviar enlace
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); mostrar("login"); }}>
                Volver al inicio de sesión
              </a>
            </form>
          )}

          <p style={{ color: mensaje.tipo === "error" ? "#ffb3b3" : "#b6ffb3" }}>
            {mensaje.texto}
          </p>
        </div>
      </main>
    </div>
  );
}
