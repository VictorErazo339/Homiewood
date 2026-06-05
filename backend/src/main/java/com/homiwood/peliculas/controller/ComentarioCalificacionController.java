package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ComentarioCalificacionRequestDTO;
import com.homiwood.peliculas.dto.ComentarioCalificacionResponseDTO;
import com.homiwood.peliculas.service.ComentarioCalificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // =========================================================
    // ENDPOINT TEMPORAL PARA PROBAR LOGROS - PASO 4
    // =========================================================

    @GetMapping("/usuario/{idUsuario}/estadisticas-logros-comentarios")
    public Map<String, Object> obtenerEstadisticasLogrosComentarios(
            @PathVariable Long idUsuario
    ) {
        return Map.of(
                "comentariosHechos", service.contarComentariosHechos(idUsuario),
                "comentariosRecibidos", service.contarComentariosRecibidos(idUsuario),
                "primerComentario", service.tienePrimerComentario(idUsuario),
                "conversador", service.esConversador(idUsuario),
                "popularEnComentarios", service.esPopularEnComentarios(idUsuario)
        );
    }
}