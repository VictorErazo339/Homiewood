package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearGrupoAutenticadoRequest;
import com.homiwood.peliculas.dto.CrearGrupoRequest;
import com.homiwood.peliculas.dto.GrupoMiembroResponse;
import com.homiwood.peliculas.dto.GrupoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Grupo;
import com.homiwood.peliculas.service.GrupoService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MiGrupoController {

    private final GrupoService grupoService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public MiGrupoController(
            GrupoService grupoService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.grupoService = grupoService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/grupos")
    public ResponseEntity<GrupoResponse> crearGrupoAutenticado(
            @Valid @RequestBody CrearGrupoAutenticadoRequest request
    ) {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        CrearGrupoRequest crearGrupoRequest = new CrearGrupoRequest();
        crearGrupoRequest.setIdCreador(idUsuario);
        crearGrupoRequest.setNombre(request.getNombre());
        crearGrupoRequest.setDescripcion(request.getDescripcion());

        Grupo grupo = grupoService.crearGrupo(crearGrupoRequest);

        return ResponseEntity.ok(responseMapper.toGrupoResponse(grupo));
    }

    @GetMapping("/grupos")
    public List<GrupoMiembroResponse> listarMisGrupos() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return grupoService.listarGruposDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toGrupoMiembroResponse)
                .toList();
    }
}