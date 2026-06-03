package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearGeneroRequest;
import com.homiwood.peliculas.dto.GeneroResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Genero;
import com.homiwood.peliculas.service.GeneroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/generos")
public class GeneroController {

    private final GeneroService generoService;
    private final ResponseMapper responseMapper;

    public GeneroController(GeneroService generoService, ResponseMapper responseMapper) {
        this.generoService = generoService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<GeneroResponse> listarGeneros() {
        return generoService.listarGeneros()
                .stream()
                .map(responseMapper::toGeneroResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public GeneroResponse buscarPorId(@PathVariable Long id) {
        return responseMapper.toGeneroResponse(generoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<GeneroResponse> crearGenero(@Valid @RequestBody CrearGeneroRequest request) {
        Genero generoCreado = generoService.crearGenero(request);
        return ResponseEntity.ok(responseMapper.toGeneroResponse(generoCreado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarGenero(@PathVariable Long id) {
        generoService.eliminarGenero(id);
        return ResponseEntity.ok("Género eliminado correctamente");
    }
}