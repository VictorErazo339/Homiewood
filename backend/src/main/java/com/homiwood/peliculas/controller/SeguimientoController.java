package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearSeguimientoRequest;
import com.homiwood.peliculas.dto.SeguimientoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Seguimiento;
import com.homiwood.peliculas.service.SeguimientoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class SeguimientoController {

    private final SeguimientoService seguimientoService;
    private final ResponseMapper responseMapper;

    public SeguimientoController(
            SeguimientoService seguimientoService,
            ResponseMapper responseMapper
    ) {
        this.seguimientoService = seguimientoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/{idSeguido}/seguidores")
    public ResponseEntity<SeguimientoResponse> seguirUsuario(
            @PathVariable Long idSeguido,
            @Valid @RequestBody CrearSeguimientoRequest request
    ) {
        Seguimiento seguimiento = seguimientoService.seguirUsuario(idSeguido, request);
        return ResponseEntity.ok(responseMapper.toSeguimientoResponse(seguimiento));
    }

    @GetMapping("/{idUsuario}/siguiendo")
    public List<SeguimientoResponse> listarUsuariosQueSigo(@PathVariable Long idUsuario) {
        return seguimientoService.listarUsuariosQueSigo(idUsuario)
                .stream()
                .map(responseMapper::toSeguimientoResponse)
                .toList();
    }

    @GetMapping("/{idUsuario}/seguidores")
    public List<SeguimientoResponse> listarMisSeguidores(@PathVariable Long idUsuario) {
        return seguimientoService.listarMisSeguidores(idUsuario)
                .stream()
                .map(responseMapper::toSeguimientoResponse)
                .toList();
    }

    @GetMapping("/{idUsuario}/siguiendo/cantidad")
    public long contarUsuariosQueSigo(@PathVariable Long idUsuario) {
        return seguimientoService.contarUsuariosQueSigo(idUsuario);
    }

    @GetMapping("/{idUsuario}/seguidores/cantidad")
    public long contarMisSeguidores(@PathVariable Long idUsuario) {
        return seguimientoService.contarMisSeguidores(idUsuario);
    }

    @DeleteMapping("/{idSeguidor}/siguiendo/{idSeguido}")
    public ResponseEntity<String> dejarDeSeguir(
            @PathVariable Long idSeguidor,
            @PathVariable Long idSeguido
    ) {
        seguimientoService.dejarDeSeguir(idSeguidor, idSeguido);
        return ResponseEntity.ok("Dejaste de seguir al usuario correctamente");
    }
}