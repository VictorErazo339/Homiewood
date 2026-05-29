package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearGrupoRequest;
import com.homiwood.peliculas.dto.GrupoMiembroResponse;
import com.homiwood.peliculas.dto.GrupoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Grupo;
import com.homiwood.peliculas.service.GrupoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
public class GrupoController {

    private final GrupoService grupoService;
    private final ResponseMapper responseMapper;

    public GrupoController(
            GrupoService grupoService,
            ResponseMapper responseMapper
    ) {
        this.grupoService = grupoService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<GrupoResponse> listarGrupos() {
        return grupoService.listarGrupos()
                .stream()
                .map(responseMapper::toGrupoResponse)
                .toList();
    }

    @GetMapping("/{idGrupo}")
    public GrupoResponse buscarGrupo(@PathVariable Long idGrupo) {
        return responseMapper.toGrupoResponse(grupoService.buscarPorId(idGrupo));
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<GrupoMiembroResponse> listarGruposDeUsuario(@PathVariable Long idUsuario) {
        return grupoService.listarGruposDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toGrupoMiembroResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<GrupoResponse> crearGrupo(@Valid @RequestBody CrearGrupoRequest request) {
        Grupo grupoCreado = grupoService.crearGrupo(request);
        return ResponseEntity.ok(responseMapper.toGrupoResponse(grupoCreado));
    }

    @DeleteMapping("/{idGrupo}")
    public ResponseEntity<String> eliminarGrupo(@PathVariable Long idGrupo) {
        grupoService.eliminarGrupo(idGrupo);
        return ResponseEntity.ok("Grupo eliminado correctamente");
    }
}