package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ComentarioCalificacionRequestDTO;
import com.homiwood.peliculas.dto.ComentarioCalificacionResponseDTO;
import com.homiwood.peliculas.model.Calificacion;
import com.homiwood.peliculas.model.ComentarioCalificacion;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ComentarioCalificacionRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComentarioCalificacionService {

    @Autowired
    private ComentarioCalificacionRepository comentarioRepo;

    @Autowired
    private CalificacionRepository calificacionRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private LogroEvaluacionPublisher logroEvaluacionPublisher;

    public ComentarioCalificacionResponseDTO agregar(ComentarioCalificacionRequestDTO dto) {
        Calificacion calificacion = calificacionRepo.findById(dto.getIdCalificacion())
                .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));

        Usuario usuario = usuarioRepo.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ComentarioCalificacion comentario = new ComentarioCalificacion();
        comentario.setCalificacion(calificacion);
        comentario.setUsuario(usuario);
        comentario.setTexto(dto.getTexto());

        ComentarioCalificacion guardado = comentarioRepo.save(comentario);
        ComentarioCalificacionResponseDTO response = toDTO(guardado);

        // NO TOCAR: mantiene WebSocket funcionando para comentarios.
        messagingTemplate.convertAndSend(
                "/topic/comentarios/" + guardado.getCalificacion().getIdCalificacion(),
                response);
        logroEvaluacionPublisher.solicitarEvaluacionVarios(
                usuario.getIdUsuario(),
                calificacion.getUsuario().getIdUsuario());

        return response;

    }

    public List<ComentarioCalificacionResponseDTO> listarPorCalificacion(Long idCalificacion) {
        return comentarioRepo
                .findByCalificacion_IdCalificacionOrderByFechaComentarioAsc(idCalificacion)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 4
    // =========================================================

    public long contarComentariosHechos(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return comentarioRepo.countByUsuario_IdUsuario(idUsuario);
    }

    public long contarComentariosRecibidos(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return comentarioRepo.contarComentariosRecibidosPorUsuario(idUsuario);
    }

    public boolean tienePrimerComentario(Long idUsuario) {
        return contarComentariosHechos(idUsuario) >= 1;
    }

    public boolean esConversador(Long idUsuario) {
        return contarComentariosHechos(idUsuario) >= 10;
    }

    public boolean esPopularEnComentarios(Long idUsuario) {
        return contarComentariosRecibidos(idUsuario) >= 10;
    }

    private void validarIdUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new RuntimeException("El idUsuario es obligatorio");
        }
    }

    private ComentarioCalificacionResponseDTO toDTO(ComentarioCalificacion c) {
        ComentarioCalificacionResponseDTO dto = new ComentarioCalificacionResponseDTO();
        dto.setIdComentario(c.getIdComentario());
        dto.setIdCalificacion(c.getCalificacion().getIdCalificacion());
        dto.setIdUsuario(c.getUsuario().getIdUsuario());
        dto.setUsername(c.getUsuario().getUsername());
        dto.setTexto(c.getTexto());
        dto.setFechaComentario(c.getFechaComentario());
        dto.setIconoPerfil(c.getUsuario().getIconoPerfil());
        return dto;
    }
}