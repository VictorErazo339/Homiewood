package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.AgregarGeneroContenidoRequest;
import com.homiwood.peliculas.dto.ContenidoGeneroResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.ContenidoGenero;
import com.homiwood.peliculas.service.ContenidoGeneroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ContenidoGeneroController {

    private final ContenidoGeneroService contenidoGeneroService;
    private final ResponseMapper responseMapper;

    public ContenidoGeneroController(
            ContenidoGeneroService contenidoGeneroService,
            ResponseMapper responseMapper
    ) {
        this.contenidoGeneroService = contenidoGeneroService;
        this.responseMapper = responseMapper;
    }

    @GetMapping("/contenidos/{idContenido}/generos")
    public List<ContenidoGeneroResponse> listarGenerosDeContenido(@PathVariable Long idContenido) {
        return contenidoGeneroService.listarGenerosDeContenido(idContenido)
                .stream()
                .map(responseMapper::toContenidoGeneroResponse)
                .toList();
    }

    @PostMapping("/contenidos/{idContenido}/generos")
    public ResponseEntity<ContenidoGeneroResponse> agregarGeneroAContenido(
            @PathVariable Long idContenido,
            @Valid @RequestBody AgregarGeneroContenidoRequest request
    ) {
        ContenidoGenero resultado = contenidoGeneroService.agregarGeneroAContenido(idContenido, request);
        return ResponseEntity.ok(responseMapper.toContenidoGeneroResponse(resultado));
    }

    @GetMapping("/generos/{idGenero}/contenidos")
    public List<ContenidoGeneroResponse> listarContenidosPorGenero(@PathVariable Long idGenero) {
        return contenidoGeneroService.listarContenidosPorGenero(idGenero)
                .stream()
                .map(responseMapper::toContenidoGeneroResponse)
                .toList();
    }

    @DeleteMapping("/contenido-generos/{idContenidoGenero}")
    public ResponseEntity<String> eliminarRelacion(@PathVariable Long idContenidoGenero) {
        contenidoGeneroService.eliminarRelacion(idContenidoGenero);
        return ResponseEntity.ok("Género eliminado del contenido correctamente");
    }
}