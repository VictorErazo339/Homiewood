package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.LikeCalificacionRequestDTO;
import com.homiwood.peliculas.dto.LikeCalificacionResponseDTO;
import com.homiwood.peliculas.service.LikeCalificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes-calificacion")
public class LikeCalificacionCalificacionController {

    @Autowired
    private LikeCalificacionService service;

    @PostMapping
    public ResponseEntity<LikeCalificacionResponseDTO> toggleLike(
            @Valid @RequestBody LikeCalificacionRequestDTO dto) {
        return ResponseEntity.ok(service.toggleLike(dto));
    }

    @GetMapping("/{idCalificacion}/{idUsuario}")
    public ResponseEntity<LikeCalificacionResponseDTO> obtenerConteos(
            @PathVariable Long idCalificacion,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.obtenerConteos(idCalificacion, idUsuario));
    }

    // =========================================================
    // ENDPOINT TEMPORAL PARA PROBAR LOGROS - PASO 4
    // =========================================================

    @GetMapping("/usuario/{idUsuario}/estadisticas-logros-likes")
    public Map<String, Object> obtenerEstadisticasLogrosLikes(
            @PathVariable Long idUsuario
    ) {
        return Map.of(
                "likesRecibidos", service.contarLikesRecibidos(idUsuario),
                "dislikesRecibidos", service.contarDislikesRecibidos(idUsuario),
                "likesHechos", service.contarLikesHechos(idUsuario),
                "dislikesHechos", service.contarDislikesHechos(idUsuario),
                "maximoLikesEnUnaResena", service.obtenerMaximoLikesEnUnaResena(idUsuario),
                "topCritico", service.esTopCritico(idUsuario),
                "criticoDeOro", service.esCriticoDeOro(idUsuario),
                "resenaPopular", service.tieneResenaPopular(idUsuario)
        );
    }
}