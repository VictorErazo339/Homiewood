package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CalificacionResponse;
import com.homiwood.peliculas.dto.CrearCalificacionRequest;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Calificacion;
import com.homiwood.peliculas.service.CalificacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calificaciones")
public class CalificacionController {

    private final CalificacionService calificacionService;
    private final ResponseMapper responseMapper;

    public CalificacionController(
            CalificacionService calificacionService,
            ResponseMapper responseMapper
    ) {
        this.calificacionService = calificacionService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<CalificacionResponse> listarCalificaciones() {
        return calificacionService.listarCalificaciones()
                .stream()
                .map(responseMapper::toCalificacionResponse)
                .toList();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<CalificacionResponse> listarPorUsuario(@PathVariable Long idUsuario) {
        return calificacionService.listarPorUsuario(idUsuario)
                .stream()
                .map(responseMapper::toCalificacionResponse)
                .toList();
    }

    @GetMapping("/contenido/{idContenido}")
    public List<CalificacionResponse> listarPorContenido(@PathVariable Long idContenido) {
        return calificacionService.listarPorContenido(idContenido)
                .stream()
                .map(responseMapper::toCalificacionResponse)
                .toList();
    }

    @GetMapping("/contenido/{idContenido}/promedio")
    public Double obtenerPromedioContenido(@PathVariable Long idContenido) {
        return calificacionService.obtenerPromedioContenido(idContenido);
    }

    @PostMapping
    public ResponseEntity<CalificacionResponse> crearCalificacion(
            @Valid @RequestBody CrearCalificacionRequest request
    ) {
        Calificacion calificacionCreada = calificacionService.crearCalificacion(request);
        return ResponseEntity.ok(responseMapper.toCalificacionResponse(calificacionCreada));
    }

    @PutMapping("/{idCalificacion}")
    public ResponseEntity<CalificacionResponse> actualizarCalificacion(
            @PathVariable Long idCalificacion,
            @Valid @RequestBody CrearCalificacionRequest request
    ) {
        Calificacion calificacionActualizada = calificacionService.actualizarCalificacion(idCalificacion, request);
        return ResponseEntity.ok(responseMapper.toCalificacionResponse(calificacionActualizada));
    }

    @DeleteMapping("/{idCalificacion}")
    public ResponseEntity<String> eliminarCalificacion(@PathVariable Long idCalificacion) {
        calificacionService.eliminarCalificacion(idCalificacion);
        return ResponseEntity.ok("Calificación eliminada correctamente");
    }
}