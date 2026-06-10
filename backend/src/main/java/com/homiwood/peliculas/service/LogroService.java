package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ActualizarLogrosDestacadosRequest;
import com.homiwood.peliculas.dto.LogroResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Logro;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.model.UsuarioLogro;
import com.homiwood.peliculas.repository.LogroRepository;
import com.homiwood.peliculas.repository.UsuarioLogroRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class LogroService {

    private static final int MAX_LOGROS_DESTACADOS = 3;

    private final LogroRepository logroRepository;
    private final UsuarioLogroRepository usuarioLogroRepository;
    private final UsuarioRepository usuarioRepository;

    private final CalificacionService calificacionService;
    private final ListaContenidoService listaContenidoService;
    private final ContenidoGeneroService contenidoGeneroService;
    private final ComentarioCalificacionService comentarioCalificacionService;
    private final LikeCalificacionService likeCalificacionService;
    private final SeguimientoService seguimientoService;
    private final NotificacionService notificacionService;

    public LogroService(
            LogroRepository logroRepository,
            UsuarioLogroRepository usuarioLogroRepository,
            UsuarioRepository usuarioRepository,
            CalificacionService calificacionService,
            ListaContenidoService listaContenidoService,
            ContenidoGeneroService contenidoGeneroService,
            ComentarioCalificacionService comentarioCalificacionService,
            LikeCalificacionService likeCalificacionService,
            SeguimientoService seguimientoService,
            NotificacionService notificacionService) {
        this.logroRepository = logroRepository;
        this.usuarioLogroRepository = usuarioLogroRepository;
        this.usuarioRepository = usuarioRepository;
        this.calificacionService = calificacionService;
        this.listaContenidoService = listaContenidoService;
        this.contenidoGeneroService = contenidoGeneroService;
        this.comentarioCalificacionService = comentarioCalificacionService;
        this.likeCalificacionService = likeCalificacionService;
        this.seguimientoService = seguimientoService;
        this.notificacionService = notificacionService;
    }

    @Transactional
    public List<LogroResponse> listarLogrosUsuario(Long idUsuario) {
        asegurarBaseLogrosUsuario(idUsuario);

        return usuarioLogroRepository.listarPorUsuarioOrdenado(idUsuario)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<LogroResponse> listarLogrosDestacados(Long idUsuario) {
        asegurarBaseLogrosUsuario(idUsuario);

        return usuarioLogroRepository.listarDestacadosPorUsuario(idUsuario)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<LogroResponse> actualizarLogrosDestacados(
            Long idUsuario,
            ActualizarLogrosDestacadosRequest request) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        if (request == null || request.getIdsLogros() == null) {
            throw new BadRequestException("Debes enviar los ids de logros destacados");
        }

        if (request.getIdsLogros().size() > MAX_LOGROS_DESTACADOS) {
            throw new BadRequestException("Solo puedes destacar máximo 3 logros");
        }

        asegurarBaseLogrosUsuario(idUsuario);

        Set<Long> idsSeleccionados = Set.copyOf(request.getIdsLogros());

        List<UsuarioLogro> logrosUsuario = usuarioLogroRepository.listarPorUsuarioOrdenado(idUsuario);

        for (UsuarioLogro usuarioLogro : logrosUsuario) {
            boolean seleccionado = idsSeleccionados.contains(
                    usuarioLogro.getLogro().getIdLogro());

            if (seleccionado && !Boolean.TRUE.equals(usuarioLogro.getDesbloqueado())) {
                throw new BadRequestException("Solo puedes destacar logros desbloqueados");
            }

            usuarioLogro.setDestacado(seleccionado);
        }

        usuarioLogroRepository.saveAll(logrosUsuario);

        return listarLogrosDestacados(idUsuario);
    }

    @Transactional
    public void evaluarLogrosUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        asegurarCatalogoLogros();
        asegurarLogrosUsuario(usuario);

        long totalResenas = calificacionService.contarResenasConComentario(idUsuario);
        long madrugada = calificacionService.contarCalificacionesMadrugada(idUsuario);
        int racha = calificacionService.calcularRachaActualUsuario(idUsuario);

        long totalVistos = listaContenidoService.contarVistosUsuario(idUsuario);
        long totalPorVer = listaContenidoService.contarPorVerUsuario(idUsuario);
        long totalTop5 = listaContenidoService.contarTop5Usuario(idUsuario);
        long vistosHoy = listaContenidoService.contarVistosHoyUsuario(idUsuario);
        long seriesVistas = listaContenidoService.contarSeriesVistas(idUsuario);
        long animesVistos = listaContenidoService.contarAnimesVistos(idUsuario);

        long generosDistintos = contenidoGeneroService.contarGenerosDistintosVistosUsuario(idUsuario);
        long romanceVistos = contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "romance");
        long dramaVistos = contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "drama");

        long comediaVistos = contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "comedia")
                + contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "comedy");

        long accionVistos = contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "acción")
                + contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "accion")
                + contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "action");

        long comentariosHechos = comentarioCalificacionService.contarComentariosHechos(idUsuario);
        long comentariosRecibidos = comentarioCalificacionService.contarComentariosRecibidos(idUsuario);

        long likesRecibidos = likeCalificacionService.contarLikesRecibidos(idUsuario);
        long likesHechos = likeCalificacionService.contarLikesHechos(idUsuario);
        long maxLikesEnResena = likeCalificacionService.obtenerMaximoLikesEnUnaResena(idUsuario);

        long siguiendo = seguimientoService.contarUsuariosQueSigo(idUsuario);
        long seguidores = seguimientoService.contarMisSeguidores(idUsuario);

        aplicarProgreso(usuario, "PRIMERA_RESENA", totalResenas);
        aplicarProgreso(usuario, "CRITICO_CAMINO", totalResenas);
        aplicarProgreso(usuario, "CIEN_RESENAS", totalResenas);
        aplicarProgreso(usuario, "RACHA_30_DIAS", racha);
        aplicarProgreso(usuario, "OCULTO_NOCHE_CINE", madrugada);

        aplicarProgreso(usuario, "PRIMERA_VISTA", totalVistos);
        aplicarProgreso(usuario, "PRIMER_POR_VER", totalPorVer);
        aplicarProgreso(usuario, "TOP5_INICIADO", totalTop5);
        aplicarProgreso(usuario, "TOP5_COMPLETO", totalTop5);
        aplicarProgreso(usuario, "CINEFILO_CASUAL", totalVistos);
        aplicarProgreso(usuario, "CINEFILO_ELITE", totalVistos);
        aplicarProgreso(usuario, "MARATONISTA", vistosHoy);
        aplicarProgreso(usuario, "SERIES_FAN", seriesVistas);
        aplicarProgreso(usuario, "ANIME_FAN", animesVistos);

        aplicarProgreso(usuario, "EXPLORADOR_GENEROS", generosDistintos);
        aplicarProgreso(usuario, "ROMANCE_FAN", romanceVistos);
        aplicarProgreso(usuario, "DRAMA_FAN", dramaVistos);
        aplicarProgreso(usuario, "COMEDIA_FAN", comediaVistos);
        aplicarProgreso(usuario, "ACCION_FAN", accionVistos);

        aplicarProgreso(usuario, "PRIMER_COMENTARIO", comentariosHechos);
        aplicarProgreso(usuario, "CONVERSADOR", comentariosHechos);
        aplicarProgreso(usuario, "POPULAR_COMENTARIOS", comentariosRecibidos);

        aplicarProgreso(usuario, "RESENA_POPULAR", maxLikesEnResena);
        aplicarProgreso(usuario, "TOP_CRITICO", likesRecibidos);
        aplicarProgreso(usuario, "CRITICO_ORO", likesRecibidos);
        aplicarProgreso(usuario, "OCULTO_PULGAR_VELOZ", likesHechos);

        aplicarProgreso(usuario, "PRIMER_HOMIE", siguiendo);
        aplicarProgreso(usuario, "SOCIABLE", siguiendo);
        aplicarProgreso(usuario, "COMUNIDAD", seguidores);
        aplicarProgreso(usuario, "LEYENDA_HOMIEWOOD", seguidores);
    }

    private void aplicarProgreso(
            Usuario usuario,
            String codigoLogro,
            long progreso) {
        Logro logro = logroRepository.findByCodigo(codigoLogro)
                .orElseThrow(() -> new NotFoundException("Logro no encontrado: " + codigoLogro));

        UsuarioLogro usuarioLogro = obtenerOCrearUsuarioLogro(usuario, logro);

        int progresoSeguro = Math.toIntExact(Math.min(progreso, Integer.MAX_VALUE));

        usuarioLogro.setProgresoActual(progresoSeguro);

        if (progreso >= logro.getValorObjetivo() && !Boolean.TRUE.equals(usuarioLogro.getDesbloqueado())) {
            usuarioLogro.setDesbloqueado(true);
            usuarioLogro.setFechaDesbloqueo(LocalDateTime.now());

            notificacionService.notificarLogroDesbloqueado(usuario, logro);

            AvatarRecompensa recompensa = avatarRecompensaPorLogro(logro.getCodigo());
            if (recompensa != null) {
                notificacionService.notificarAvatarDesbloqueado(usuario, recompensa.nombreVisible());
            }
        }

        usuarioLogroRepository.save(usuarioLogro);
    }

    private AvatarRecompensa avatarRecompensaPorLogro(String codigoLogro) {
        if (codigoLogro == null) {
            return null;
        }

        return switch (codigoLogro) {
            case "PRIMERA_RESENA" -> new AvatarRecompensa("Avatar reseñista");
            case "PRIMERA_VISTA" -> new AvatarRecompensa("Avatar watchlist");
            case "PRIMER_POR_VER" -> new AvatarRecompensa("Avatar pendiente");
            case "TOP5_INICIADO" -> new AvatarRecompensa("Hamster cinéfilo");
            case "TOP5_COMPLETO" -> new AvatarRecompensa("Cyber Hamster");
            case "PRIMER_COMENTARIO" -> new AvatarRecompensa("Hamster comentarista");
            case "PRIMER_HOMIE" -> new AvatarRecompensa("Hamster homie");
            case "CINEFILO_CASUAL" -> new AvatarRecompensa("Cinéfilo casual");
            case "SERIES_FAN" -> new AvatarRecompensa("Miku Hamster");
            case "ANIME_FAN" -> new AvatarRecompensa("Otaku inicial");
            case "ROMANCE_FAN" -> new AvatarRecompensa("Corazón romance");
            case "COMEDIA_FAN" -> new AvatarRecompensa("Risa asegurada");
            case "ACCION_FAN" -> new AvatarRecompensa("Adrenalina pura");
            case "EXPLORADOR_GENEROS" -> new AvatarRecompensa("Explorador");
            case "LEYENDA_HOMIEWOOD" -> new AvatarRecompensa("Leyenda Homiewood");
            default -> null;
        };
    }

    private record AvatarRecompensa(String nombreVisible) {
    }

    private void asegurarLogrosUsuario(Usuario usuario) {
        List<Logro> logrosActivos = logroRepository.findByActivoTrueOrderByOrdenAscNombreAsc();

        for (Logro logro : logrosActivos) {
            obtenerOCrearUsuarioLogro(usuario, logro);
        }
    }

    private UsuarioLogro obtenerOCrearUsuarioLogro(Usuario usuario, Logro logro) {
        return usuarioLogroRepository
                .findByUsuarioIdUsuarioAndLogroIdLogro(
                        usuario.getIdUsuario(),
                        logro.getIdLogro())
                .orElseGet(() -> {
                    UsuarioLogro nuevo = new UsuarioLogro();
                    nuevo.setUsuario(usuario);
                    nuevo.setLogro(logro);
                    nuevo.setProgresoActual(0);
                    nuevo.setDesbloqueado(false);
                    nuevo.setDestacado(false);
                    return usuarioLogroRepository.save(nuevo);
                });
    }

    private void asegurarCatalogoLogros() {
        crearLogroSiNoExiste("PRIMERA_RESENA", "Primera Reseña", "Publica tu primera reseña", "📝", "FACIL", 1, false,
                10);
        crearLogroSiNoExiste("PRIMERA_VISTA", "Ya empecé", "Agrega tu primer contenido a Vistas", "🎬", "FACIL", 1,
                false, 20);
        crearLogroSiNoExiste("PRIMER_POR_VER", "Lo veré pronto", "Agrega tu primer contenido a Por ver", "📌", "FACIL",
                1, false, 30);
        crearLogroSiNoExiste("TOP5_INICIADO", "Top Personal", "Agrega un contenido a tu Top 5", "🏅", "FACIL", 1, false,
                40);
        crearLogroSiNoExiste("PRIMER_COMENTARIO", "Opinión compartida", "Haz tu primer comentario", "💬", "FACIL", 1,
                false, 50);
        crearLogroSiNoExiste("PRIMER_HOMIE", "Nuevo Homie", "Sigue a tu primer usuario", "🤝", "FACIL", 1, false, 60);

        crearLogroSiNoExiste("CRITICO_CAMINO", "Crítico en camino", "Publica 10 reseñas", "⭐", "MEDIO", 10, false, 110);
        crearLogroSiNoExiste("TOP5_COMPLETO", "Top 5 Completo", "Completa tu Top 5", "🏆", "MEDIO", 5, false, 120);
        crearLogroSiNoExiste("CINEFILO_CASUAL", "Cinéfilo Casual", "Registra 25 contenidos vistos", "🍿", "MEDIO", 25,
                false, 130);
        crearLogroSiNoExiste("SERIES_FAN", "Maratón de Series", "Registra 10 series vistas", "📺", "MEDIO", 10, false,
                140);
        crearLogroSiNoExiste("ANIME_FAN", "Otaku Inicial", "Registra 10 animes vistos", "🌸", "MEDIO", 10, false, 150);
        crearLogroSiNoExiste("ROMANCE_FAN", "Corazón de Romance", "Registra 5 contenidos vistos de Romance", "💗",
                "MEDIO", 5, false, 160);
        crearLogroSiNoExiste("DRAMA_FAN", "Drama Lover", "Registra 5 contenidos vistos de Drama", "🎭", "MEDIO", 5,
                false, 170);
        crearLogroSiNoExiste("COMEDIA_FAN", "Risa asegurada", "Registra 5 contenidos vistos de Comedia", "😂", "MEDIO",
                5, false, 180);
        crearLogroSiNoExiste("ACCION_FAN", "Adrenalina pura", "Registra 5 contenidos vistos de Acción", "💥", "MEDIO",
                5, false, 190);
        crearLogroSiNoExiste("CONVERSADOR", "Conversador", "Haz 10 comentarios", "🗣️", "MEDIO", 10, false, 200);
        crearLogroSiNoExiste("SOCIABLE", "Sociable", "Sigue a 10 homies", "👥", "MEDIO", 10, false, 210);
        crearLogroSiNoExiste("COMUNIDAD", "Comunidad", "Consigue 10 seguidores", "🏘️", "MEDIO", 10, false, 220);
        crearLogroSiNoExiste("RESENA_POPULAR", "Reseña Popular", "Consigue 10 likes en una reseña", "🔥", "MEDIO", 10,
                false, 230);

        crearLogroSiNoExiste("CIEN_RESENAS", "100 Reseñas", "Publica 100 reseñas", "🎞️", "DIFICIL", 100, false, 310);
        crearLogroSiNoExiste("RACHA_30_DIAS", "Racha 30 días", "Mantén actividad durante 30 días seguidos", "🔥",
                "DIFICIL", 30, false, 320);
        crearLogroSiNoExiste("CINEFILO_ELITE", "Cinéfilo Élite", "Registra 500 contenidos vistos", "🌟", "DIFICIL", 500,
                false, 330);
        crearLogroSiNoExiste("CRITICO_ORO", "Crítico de Oro", "Recibe 500 likes en tus reseñas", "🎭", "DIFICIL", 500,
                false, 340);
        crearLogroSiNoExiste("MARATONISTA", "Maratonista", "Registra 5 contenidos vistos en un día", "🎪", "DIFICIL", 5,
                false, 350);
        crearLogroSiNoExiste("LEYENDA_HOMIEWOOD", "Leyenda Homiewood", "Consigue 1000 seguidores", "👑", "DIFICIL",
                1000, false, 360);
        crearLogroSiNoExiste("TOP_CRITICO", "Top Crítico", "Recibe 50 likes en tus reseñas", "🏆", "DIFICIL", 50, false,
                370);
        crearLogroSiNoExiste("EXPLORADOR_GENEROS", "Explorador de Géneros", "Ve contenido de 10 géneros distintos",
                "🧭", "DIFICIL", 10, false, 380);
        crearLogroSiNoExiste("POPULAR_COMENTARIOS", "Centro de conversación", "Recibe 10 comentarios en tus reseñas",
                "💬", "DIFICIL", 10, false, 390);

        crearLogroSiNoExiste("OCULTO_NOCHE_CINE", "Noche de Cine", "Publica una reseña entre las 00:00 y 04:00", "🌙",
                "OCULTO", 1, true, 510);
        crearLogroSiNoExiste("OCULTO_PULGAR_VELOZ", "Pulgar Veloz", "Da 20 likes a reseñas de otros usuarios", "⚡",
                "OCULTO", 20, true, 520);
    }

    private void crearLogroSiNoExiste(
            String codigo,
            String nombre,
            String descripcion,
            String icono,
            String dificultad,
            Integer valorObjetivo,
            Boolean oculto,
            Integer orden) {
        logroRepository.findByCodigo(codigo).orElseGet(() -> {
            Logro logro = new Logro();
            logro.setCodigo(codigo);
            logro.setNombre(nombre);
            logro.setDescripcion(descripcion);
            logro.setIcono(icono);
            logro.setDificultad(dificultad);
            logro.setValorObjetivo(valorObjetivo);
            logro.setOculto(oculto);
            logro.setActivo(true);
            logro.setOrden(orden);
            return logroRepository.save(logro);
        });
    }

    private LogroResponse toResponse(UsuarioLogro usuarioLogro) {
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
    private void asegurarBaseLogrosUsuario(Long idUsuario) {
    if (idUsuario == null) {
        throw new BadRequestException("El idUsuario es obligatorio");
    }

    Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

    asegurarCatalogoLogros();
    asegurarLogrosUsuario(usuario);
}
}