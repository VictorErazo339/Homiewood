package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.GuardarYAgregarContenidoRequest;
import com.homiwood.peliculas.dto.ListaContenidoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.service.UsuarioListaSyncService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios/{idUsuario}/listas")
public class UsuarioListaSyncController {

    private final UsuarioListaSyncService usuarioListaSyncService;
    private final ResponseMapper responseMapper;

    public UsuarioListaSyncController(
            UsuarioListaSyncService usuarioListaSyncService,
            ResponseMapper responseMapper
    ) {
        this.usuarioListaSyncService = usuarioListaSyncService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/{tipoLista}/contenidos/externo")
    public ListaContenidoResponse guardarEnLista(
            @PathVariable Long idUsuario,
            @PathVariable String tipoLista,
            @Valid @RequestBody GuardarYAgregarContenidoRequest request
    ) {
        return responseMapper.toListaContenidoResponse(
                usuarioListaSyncService.guardarContenidoUsuario(idUsuario, tipoLista, request)
        );
    }

    @GetMapping("/contenidos")
    public List<ListaContenidoResponse> listarPorEstado(
            @PathVariable Long idUsuario,
            @RequestParam String estado
    ) {
        return usuarioListaSyncService.listarPorEstado(idUsuario, estado)
                .stream()
                .map(responseMapper::toListaContenidoResponse)
                .toList();
    }
}