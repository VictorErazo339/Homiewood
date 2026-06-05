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

        @Autowired
        private LogroEvaluacionPublisher logroEvaluacionPublisher;

        public LikeCalificacionResponseDTO toggleLike(LikeCalificacionRequestDTO dto) {
                Calificacion calificacion = calificacionRepo.findById(dto.getIdCalificacion())
                                .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));

                Usuario usuario = usuarioRepo.findById(dto.getIdUsuario())
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                Optional<LikeCalificacion> existente = likeRepo
                                .findByCalificacion_IdCalificacionAndUsuario_IdUsuario(
                                                dto.getIdCalificacion(), dto.getIdUsuario());

                if (existente.isPresent()) {
                        LikeCalificacion like = existente.get();

                        if (like.getTipo() == dto.getTipo()) {
                                likeRepo.delete(like);
                        } else {
                                like.setTipo(dto.getTipo());
                                likeRepo.save(like);
                        }
                } else {
                        LikeCalificacion nuevo = new LikeCalificacion();
                        nuevo.setCalificacion(calificacion);
                        nuevo.setUsuario(usuario);
                        nuevo.setTipo(dto.getTipo());
                        likeRepo.save(nuevo);
                }

                LikeCalificacionResponseDTO response = buildResponse(
                                dto.getIdCalificacion(), dto.getIdUsuario());

                // NO TOCAR: mantiene WebSocket funcionando para likes.
                messagingTemplate.convertAndSend(
                                "/topic/likes/" + dto.getIdCalificacion(),
                                response);
                logroEvaluacionPublisher.solicitarEvaluacionVarios(
                                usuario.getIdUsuario(),
                                calificacion.getUsuario().getIdUsuario());
                return response;
        }

        public LikeCalificacionResponseDTO obtenerConteos(Long idCalificacion, Long idUsuario) {
                return buildResponse(idCalificacion, idUsuario);
        }

        // =========================================================
        // MÉTODOS PARA LOGROS - PASO 4
        // =========================================================

        public long contarLikesRecibidos(Long idUsuario) {
                validarIdUsuario(idUsuario);
                return likeRepo.contarReaccionesRecibidasPorUsuario(
                                idUsuario,
                                LikeCalificacion.TipoLike.LIKE);
        }

        public long contarDislikesRecibidos(Long idUsuario) {
                validarIdUsuario(idUsuario);
                return likeRepo.contarReaccionesRecibidasPorUsuario(
                                idUsuario,
                                LikeCalificacion.TipoLike.DISLIKE);
        }

        public long contarLikesHechos(Long idUsuario) {
                validarIdUsuario(idUsuario);
                return likeRepo.contarReaccionesHechasPorUsuario(
                                idUsuario,
                                LikeCalificacion.TipoLike.LIKE);
        }

        public long contarDislikesHechos(Long idUsuario) {
                validarIdUsuario(idUsuario);
                return likeRepo.contarReaccionesHechasPorUsuario(
                                idUsuario,
                                LikeCalificacion.TipoLike.DISLIKE);
        }

        public long obtenerMaximoLikesEnUnaResena(Long idUsuario) {
                validarIdUsuario(idUsuario);
                return likeRepo.obtenerMaximoLikesEnUnaCalificacion(idUsuario);
        }

        public boolean esTopCritico(Long idUsuario) {
                return contarLikesRecibidos(idUsuario) >= 50;
        }

        public boolean esCriticoDeOro(Long idUsuario) {
                return contarLikesRecibidos(idUsuario) >= 500;
        }

        public boolean tieneResenaPopular(Long idUsuario) {
                return obtenerMaximoLikesEnUnaResena(idUsuario) >= 10;
        }

        private LikeCalificacionResponseDTO buildResponse(Long idCalificacion, Long idUsuario) {
                LikeCalificacionResponseDTO response = new LikeCalificacionResponseDTO();

                response.setIdCalificacion(idCalificacion);

                response.setTotalLikes(likeRepo.countByCalificacion_IdCalificacionAndTipo(
                                idCalificacion,
                                LikeCalificacion.TipoLike.LIKE));

                response.setTotalDislikes(likeRepo.countByCalificacion_IdCalificacionAndTipo(
                                idCalificacion,
                                LikeCalificacion.TipoLike.DISLIKE));

                likeRepo.findByCalificacion_IdCalificacionAndUsuario_IdUsuario(
                                idCalificacion,
                                idUsuario)
                                .ifPresent(l -> response.setTipoUsuario(l.getTipo()));

                return response;
        }

        private void validarIdUsuario(Long idUsuario) {
                if (idUsuario == null) {
                        throw new RuntimeException("El idUsuario es obligatorio");
                }
        }
}