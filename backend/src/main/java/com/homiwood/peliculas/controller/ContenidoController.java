package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ContenidoResponse;
import com.homiwood.peliculas.dto.CrearContenidoRequest;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.service.ContenidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contenidos")
public class ContenidoController {

    private final ContenidoService contenidoService;
    private final ResponseMapper responseMapper;

    public ContenidoController(ContenidoService contenidoService, ResponseMapper responseMapper) {
        this.contenidoService = contenidoService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<ContenidoResponse> listarContenidos() {
        return contenidoService.listarContenidos()
                .stream()
                .map(responseMapper::toContenidoResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ContenidoResponse buscarPorId(@PathVariable Long id) {
        return responseMapper.toContenidoResponse(contenidoService.buscarPorId(id));
    }

    @GetMapping("/tipo/{tipoContenido}")
    public List<ContenidoResponse> buscarPorTipo(@PathVariable String tipoContenido) {
        return contenidoService.buscarPorTipo(tipoContenido)
                .stream()
                .map(responseMapper::toContenidoResponse)
                .toList();
    }

    @GetMapping("/buscar")
    public List<ContenidoResponse> buscarPorTitulo(@RequestParam String titulo) {
        return contenidoService.buscarPorTitulo(titulo)
                .stream()
                .map(responseMapper::toContenidoResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ContenidoResponse> crearContenido(@Valid @RequestBody CrearContenidoRequest request) {
        Contenido contenidoCreado = contenidoService.crearContenido(request);
        return ResponseEntity.ok(responseMapper.toContenidoResponse(contenidoCreado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarContenido(@PathVariable Long id) {
        contenidoService.eliminarContenido(id);
        return ResponseEntity.ok("Contenido eliminado correctamente");
    }
}