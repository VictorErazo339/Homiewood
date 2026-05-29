package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.LikeCalificacionRequestDTO;
import com.homiwood.peliculas.dto.LikeCalificacionResponseDTO;
import com.homiwood.peliculas.model.Calificacion;
import com.homiwood.peliculas.model.LikeCalificacion;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.LikeCalificacionRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LikeCalificacionService {

    @Autowired
    private LikeCalificacionRepository likeRepo;

    @Autowired
    private CalificacionRepository calificacionRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public LikeCalificacionResponseDTO toggleLike(LikeCalificacionRequestDTO dto) {
        Calificacion calificacion = calificacionRepo.findById(dto.getIdCalificacion())
                .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));

        Usuario usuario = usuarioRepo.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Optional<LikeCalificacion> existente = likeRepo
                .findByCalificacion_IdCalificacionAndUsuario_IdUsuario(
                        dto.getIdCalificacion(), dto.getIdUsuario()
                );

        if (existente.isPresent()) {
            LikeCalificacion like = existente.get();
            if (like.getTipo() == dto.getTipo()) {
                // Mismo tipo → eliminar (toggle off)
                likeRepo.delete(like);
            } else {
                // Tipo distinto → cambiar de like a dislike o viceversa
                like.setTipo(dto.getTipo());
                likeRepo.save(like);
            }
        } else {
            // No existe → crear nuevo
            LikeCalificacion nuevo = new LikeCalificacion();
            nuevo.setCalificacion(calificacion);
            nuevo.setUsuario(usuario);
            nuevo.setTipo(dto.getTipo());
            likeRepo.save(nuevo);
        }

        LikeCalificacionResponseDTO response = buildResponse(
                dto.getIdCalificacion(), dto.getIdUsuario()
        );

        // Emitir por WebSocket
        messagingTemplate.convertAndSend(
                "/topic/likes/" + dto.getIdCalificacion(),
                response
        );

        return response;
    }

    public LikeCalificacionResponseDTO obtenerConteos(Long idCalificacion, Long idUsuario) {
        return buildResponse(idCalificacion, idUsuario);
    }

    private LikeCalificacionResponseDTO buildResponse(Long idCalificacion, Long idUsuario) {
        LikeCalificacionResponseDTO response = new LikeCalificacionResponseDTO();
        response.setIdCalificacion(idCalificacion);
        response.setTotalLikes(likeRepo.countByCalificacion_IdCalificacionAndTipo(
                idCalificacion, LikeCalificacion.TipoLike.LIKE
        ));
        response.setTotalDislikes(likeRepo.countByCalificacion_IdCalificacionAndTipo(
                idCalificacion, LikeCalificacion.TipoLike.DISLIKE
        ));

        likeRepo.findByCalificacion_IdCalificacionAndUsuario_IdUsuario(idCalificacion, idUsuario)
                .ifPresent(l -> response.setTipoUsuario(l.getTipo()));

        return response;
    }
}