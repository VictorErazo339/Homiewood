package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ComentarioCalificacionRequestDTO;
import com.homiwood.peliculas.dto.ComentarioCalificacionResponseDTO;
import com.homiwood.peliculas.service.ComentarioCalificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentarios-calificacion")
public class ComentarioCalificacionController {

    @Autowired
    private ComentarioCalificacionService service;

    @PostMapping
    public ResponseEntity<ComentarioCalificacionResponseDTO> agregar(
            @Valid @RequestBody ComentarioCalificacionRequestDTO dto) {
        return ResponseEntity.ok(service.agregar(dto));
    }

    @GetMapping("/{idCalificacion}")
    public ResponseEntity<List<ComentarioCalificacionResponseDTO>> listar(
            @PathVariable Long idCalificacion) {
        return ResponseEntity.ok(service.listarPorCalificacion(idCalificacion));
    }
}