package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.LikeCalificacionRequestDTO;
import com.homiwood.peliculas.dto.LikeCalificacionResponseDTO;
import com.homiwood.peliculas.service.LikeCalificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes-calificacion")
public class LikeCalificacionCalificacionController {

    @Autowired
    private LikeCalificacionService service;

    // Toggle like/dislike
    @PostMapping
    public ResponseEntity<LikeCalificacionResponseDTO> toggleLike(
            @Valid @RequestBody LikeCalificacionRequestDTO dto) {
        return ResponseEntity.ok(service.toggleLike(dto));
    }

    // Obtener conteos de un post para un usuario
    @GetMapping("/{idCalificacion}/{idUsuario}")
    public ResponseEntity<LikeCalificacionResponseDTO> obtenerConteos(
            @PathVariable Long idCalificacion,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.obtenerConteos(idCalificacion, idUsuario));
    }
}