package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ActualizarPerfilRequest;
import com.homiwood.peliculas.dto.CrearUsuarioRequest;
import com.homiwood.peliculas.dto.LogroResponse;
import com.homiwood.peliculas.dto.PerfilResumenResponse;
import com.homiwood.peliculas.dto.UsuarioSearchResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Logro;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.model.UsuarioLogro;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.SeguimientoRepository;
import com.homiwood.peliculas.repository.UsuarioLogroRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CalificacionRepository calificacionRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final UsuarioLogroRepository usuarioLogroRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            CalificacionRepository calificacionRepository,
            SeguimientoRepository seguimientoRepository,
            UsuarioLogroRepository usuarioLogroRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.calificacionRepository = calificacionRepository;
        this.seguimientoRepository = seguimientoRepository;
        this.usuarioLogroRepository = usuarioLogroRepository;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario crearUsuario(CrearUsuarioRequest request) {

        String username = normalizarUsername(request.getUsername());
        String email = request.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            throw new DuplicateResourceException("El username ya está registrado");
        }

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setIconoPerfil(1);
        usuario.setPerfilPrivado(false);

        return usuarioRepository.save(usuario);
    }

    private String normalizarUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new BadRequestException("El username es obligatorio");
        }

        String usernameLimpio = username.trim().toLowerCase();

        if (usernameLimpio.startsWith("@")) {
            usernameLimpio = usernameLimpio.substring(1);
        }

        return usernameLimpio;
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    public List<UsuarioSearchResponse> buscarUsuarios(String query) {

        if (query == null || query.trim().isBlank()) {
            return List.of();
        }

        String texto = query.trim();

        return usuarioRepository
                .findTop10ByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(texto, texto)
                .stream()
                .map(usuario -> new UsuarioSearchResponse(
                        usuario.getIdUsuario(),
                        usuario.getNombre(),
                        usuario.getUsername(),
                        usuario.getDescripcion(),
                        usuario.getIconoPerfil(),
                        usuario.getPerfilPrivado()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PerfilResumenResponse obtenerPerfilResumen(Long idUsuario) {
        Usuario usuario = buscarPorId(idUsuario);

        Long cantidadPosts = calificacionRepository.contarResenasConComentario(idUsuario);
        Long cantidadSeguidores = seguimientoRepository.countBySeguidoIdUsuario(idUsuario);
        Long cantidadSiguiendo = seguimientoRepository.countBySeguidorIdUsuario(idUsuario);

        List<LogroResponse> logrosDestacados = usuarioLogroRepository
                .listarDestacadosPorUsuario(idUsuario)
                .stream()
                .map(this::toLogroResponse)
                .toList();

        PerfilResumenResponse response = new PerfilResumenResponse();

        response.setIdUsuario(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setUsername(usuario.getUsername());
        response.setDescripcion(usuario.getDescripcion());
        response.setIconoPerfil(usuario.getIconoPerfil());
        response.setPerfilPrivado(usuario.getPerfilPrivado());

        response.setCantidadPosts(cantidadPosts);
        response.setCantidadSeguidores(cantidadSeguidores);
        response.setCantidadSiguiendo(cantidadSiguiendo);

        response.setLogrosDestacados(logrosDestacados);

        return response;
    }

    private LogroResponse toLogroResponse(UsuarioLogro usuarioLogro) {
        Logro logro = usuarioLogro.getLogro();

        boolean desbloqueado = Boolean.TRUE.equals(usuarioLogro.getDesbloqueado());
        boolean oculto = Boolean.TRUE.equals(logro.getOculto());
        boolean visible = !oculto || desbloqueado;

        LogroResponse response = new LogroResponse();

        response.setIdLogro(logro.getIdLogro());
        response.setOculto(oculto);
        response.setVisible(visible);
        response.setDesbloqueado(desbloqueado);
        response.setDestacado(Boolean.TRUE.equals(usuarioLogro.getDestacado()));
        response.setFechaDesbloqueo(usuarioLogro.getFechaDesbloqueo());
        response.setDificultad(logro.getDificultad());
        response.setValorObjetivo(logro.getValorObjetivo());
        response.setProgresoActual(usuarioLogro.getProgresoActual());

        if (visible) {
            response.setCodigo(logro.getCodigo());
            response.setNombre(logro.getNombre());
            response.setDescripcion(logro.getDescripcion());
            response.setIcono(logro.getIcono());
        } else {
            response.setCodigo("OCULTO");
            response.setNombre("???");
            response.setDescripcion("Logro oculto. Sigue usando Homiewood para descubrirlo.");
            response.setIcono("🔒");
        }

        return response;
    }

    public Usuario actualizarPerfil(Long id, ActualizarPerfilRequest request) {
        Usuario usuario = buscarPorId(id);

        usuario.setNombre(request.getNombre().trim());

        String descripcion = request.getDescripcion();

        if (descripcion == null || descripcion.trim().isBlank()) {
            usuario.setDescripcion(null);
        } else {
            usuario.setDescripcion(descripcion.trim());
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarIconoPerfil(Long id, Integer iconoPerfil) {
        if (iconoPerfil == null || iconoPerfil < 1 || iconoPerfil > 10) {
            throw new BadRequestException("El icono debe ser un número entre 1 y 10");
        }

        Usuario usuario = buscarPorId(id);
        usuario.setIconoPerfil(iconoPerfil);

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarPrivacidadPerfil(Long id, Boolean perfilPrivado) {
        if (perfilPrivado == null) {
            throw new BadRequestException("Debes indicar si el perfil será privado o público");
        }

        Usuario usuario = buscarPorId(id);
        usuario.setPerfilPrivado(perfilPrivado);

        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {

        if (!usuarioRepository.existsById(id)) {
            throw new NotFoundException("Usuario no encontrado");
        }

        usuarioRepository.deleteById(id);
    }

    public Usuario buscarPorUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new BadRequestException("El username es obligatorio");
        }

        String usernameLimpio = username.trim();

        if (usernameLimpio.startsWith("@")) {
            usernameLimpio = usernameLimpio.substring(1);
        }

        return usuarioRepository.findByUsernameIgnoreCase(usernameLimpio)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}