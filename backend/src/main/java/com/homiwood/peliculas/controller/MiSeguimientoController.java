package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearSeguimientoRequest;
import com.homiwood.peliculas.dto.SeguimientoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Seguimiento;
import com.homiwood.peliculas.service.SeguimientoService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MiSeguimientoController {

    private final SeguimientoService seguimientoService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public MiSeguimientoController(
            SeguimientoService seguimientoService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.seguimientoService = seguimientoService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/siguiendo/{idSeguido}")
    public ResponseEntity<SeguimientoResponse> seguirUsuarioAutenticado(
            @PathVariable Long idSeguido
    ) {
        Long idSeguidor = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        CrearSeguimientoRequest request = new CrearSeguimientoRequest();
        request.setIdSeguidor(idSeguidor);

        Seguimiento seguimiento = seguimientoService.seguirUsuario(idSeguido, request);

        return ResponseEntity.ok(responseMapper.toSeguimientoResponse(seguimiento));
    }

    @DeleteMapping("/siguiendo/{idSeguido}")
    public ResponseEntity<String> dejarDeSeguirUsuarioAutenticado(
            @PathVariable Long idSeguido
    ) {
        Long idSeguidor = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        seguimientoService.dejarDeSeguir(idSeguidor, idSeguido);

        return ResponseEntity.ok("Dejaste de seguir al usuario correctamente");
    }

    @GetMapping("/siguiendo")
    public List<SeguimientoResponse> listarUsuariosQueSigo() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return seguimientoService.listarUsuariosQueSigo(idUsuario)
                .stream()
                .map(responseMapper::toSeguimientoResponse)
                .toList();
    }

    @GetMapping("/seguidores")
    public List<SeguimientoResponse> listarMisSeguidores() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return seguimientoService.listarMisSeguidores(idUsuario)
                .stream()
                .map(responseMapper::toSeguimientoResponse)
                .toList();
    }
}