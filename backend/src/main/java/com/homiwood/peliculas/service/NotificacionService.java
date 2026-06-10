package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.NotificacionResponse;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Logro;
import com.homiwood.peliculas.model.Notificacion;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.NotificacionRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> listarUltimas(Long idUsuario) {
        validarUsuario(idUsuario);

        return notificacionRepository
                .findTop5ByUsuarioIdUsuarioOrderByFechaCreacionDesc(idUsuario)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void marcarTodasComoLeidas(Long idUsuario) {
        validarUsuario(idUsuario);

        List<Notificacion> notificaciones = notificacionRepository.findByUsuarioIdUsuario(idUsuario);
        for (Notificacion notificacion : notificaciones) {
            notificacion.setLeida(true);
        }
        notificacionRepository.saveAll(notificaciones);
    }

    @Transactional
    public void eliminarTodas(Long idUsuario) {
        validarUsuario(idUsuario);
        notificacionRepository.deleteByUsuarioIdUsuario(idUsuario);
    }

    @Transactional
    public void crear(Usuario usuario, String tipo, String titulo, String mensaje, String icono) {
        if (usuario == null || usuario.getIdUsuario() == null) {
            return;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setIcono(icono);
        notificacion.setLeida(false);

        notificacionRepository.save(notificacion);
    }

    @Transactional
    public void notificarLogroDesbloqueado(Usuario usuario, Logro logro) {
        crear(
                usuario,
                "LOGRO_DESBLOQUEADO",
                "Ganaste un logro",
                "Desbloqueaste: " + logro.getNombre(),
                "🏆"
        );
    }

    @Transactional
    public void notificarAvatarDesbloqueado(Usuario usuario, String avatarNombre) {
        crear(
                usuario,
                "AVATAR_DESBLOQUEADO",
                "Nuevo avatar disponible",
                "Desbloqueaste el avatar " + avatarNombre,
                "🎁"
        );
    }

    private Usuario validarUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new NotFoundException("Usuario no encontrado");
        }

        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private NotificacionResponse toResponse(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getIdNotificacion(),
                notificacion.getTipo(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getIcono(),
                Boolean.TRUE.equals(notificacion.getLeida()),
                notificacion.getFechaCreacion()
        );
    }
}
