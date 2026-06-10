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
import java.util.Map;
import java.util.Set;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CalificacionRepository calificacionRepository;
    private final SeguimientoRepository seguimientoRepository;
    private static final String TEMA_PERFIL_DEFAULT = "yellow";
    private static final String PORTADA_PERFIL_DEFAULT = "top1";

    private static final Set<String> TEMAS_PERFIL_VALIDOS = Set.of(
            "yellow", "crimson", "blue", "pink", "purple", "neon", "sunset", "mint", "sage"
    );

    private static final Set<String> PORTADAS_PERFIL_VALIDAS = Set.of(
            "top1", "top2", "top3", "top4", "top5", "none"
    );

    private static final Map<String, String> LOGRO_POR_AVATAR_PERFIL = Map.ofEntries(
            Map.entry("avatar1.webp", "PRIMERA_RESENA"),
            Map.entry("avatar2.webp", "PRIMERA_VISTA"),
            Map.entry("avatar3.webp", "PRIMER_POR_VER"),
            Map.entry("hamstericon.webp", "TOP5_INICIADO"),
            Map.entry("cyberhamster.webp", "TOP5_COMPLETO"),
            Map.entry("hamstercomment.webp", "PRIMER_COMENTARIO"),
            Map.entry("hamstersolo.webp", "PRIMER_HOMIE"),
            Map.entry("cinefilocasual.webp", "CINEFILO_CASUAL"),
            Map.entry("mikuhamster.webp", "SERIES_FAN"),
            Map.entry("gokuotakuinicial.webp", "ANIME_FAN"),
            Map.entry("corazonromance.webp", "ROMANCE_FAN"),
            Map.entry("risaasegurada.webp", "COMEDIA_FAN"),
            Map.entry("adrenalinapura.webp", "ACCION_FAN"),
            Map.entry("exploradordegeneros.webp", "EXPLORADOR_GENEROS"),
            Map.entry("leyendahomiewood.webp", "LEYENDA_HOMIEWOOD")
    );

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
        usuario.setAvatarPerfil(null);
        usuario.setPerfilPrivado(false);
        usuario.setTemaPerfil(TEMA_PERFIL_DEFAULT);
        usuario.setPortadaPerfil(PORTADA_PERFIL_DEFAULT);

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
        response.setAvatarPerfil(usuario.getAvatarPerfil());
        response.setPerfilPrivado(usuario.getPerfilPrivado());
        response.setTemaPerfil(normalizarTemaPerfil(usuario.getTemaPerfil()));
        response.setPortadaPerfil(normalizarPortadaPerfil(usuario.getPortadaPerfil()));

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

        if (request.getTemaPerfil() != null) {
            usuario.setTemaPerfil(normalizarTemaPerfil(request.getTemaPerfil()));
        }

        if (request.getPortadaPerfil() != null) {
            usuario.setPortadaPerfil(normalizarPortadaPerfil(request.getPortadaPerfil()));
        }

        if (request.getAvatarPerfil() != null) {
            usuario.setAvatarPerfil(normalizarAvatarPerfil(usuario.getIdUsuario(), request.getAvatarPerfil()));
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

    private String normalizarTemaPerfil(String temaPerfil) {
        if (temaPerfil == null || temaPerfil.trim().isBlank()) {
            return TEMA_PERFIL_DEFAULT;
        }

        String tema = temaPerfil.trim().toLowerCase();

        if (!TEMAS_PERFIL_VALIDOS.contains(tema)) {
            throw new BadRequestException("El tema de perfil no es válido");
        }

        return tema;
    }

    private String normalizarPortadaPerfil(String portadaPerfil) {
        if (portadaPerfil == null || portadaPerfil.trim().isBlank()) {
            return PORTADA_PERFIL_DEFAULT;
        }

        String portada = portadaPerfil.trim().toLowerCase();

        if (!PORTADAS_PERFIL_VALIDAS.contains(portada)) {
            throw new BadRequestException("La portada de perfil no es válida");
        }

        return portada;
    }

    private String normalizarAvatarPerfil(Long idUsuario, String avatarPerfil) {
        if (avatarPerfil == null || avatarPerfil.trim().isBlank()) {
            return null;
        }

        String avatar = limpiarNombreArchivo(avatarPerfil);

        String codigoLogro = LOGRO_POR_AVATAR_PERFIL.get(avatar);
        if (codigoLogro == null) {
            throw new BadRequestException("El avatar de perfil no es válido");
        }

        UsuarioLogro usuarioLogro = usuarioLogroRepository
                .findByUsuarioIdUsuarioAndLogroCodigo(idUsuario, codigoLogro)
                .orElseThrow(() -> new BadRequestException("Aún no has desbloqueado este avatar"));

        if (!Boolean.TRUE.equals(usuarioLogro.getDesbloqueado())) {
            throw new BadRequestException("Aún no has desbloqueado este avatar");
        }

        return avatar;
    }

    private String limpiarNombreArchivo(String valor) {
        return valor.trim()
                .replace("\\", "/")
                .replaceFirst("^/+", "")
                .replaceFirst("^\\./img/", "")
                .replaceFirst("^img/", "")
                .replaceFirst("^assets/img/", "")
                .replaceFirst("^src/assets/img/", "");
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