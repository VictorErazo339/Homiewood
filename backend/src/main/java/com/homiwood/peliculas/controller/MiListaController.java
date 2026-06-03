package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearListaAutenticadaRequest;
import com.homiwood.peliculas.dto.ListaResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.service.ListaService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/listas")
public class MiListaController {

    private final ListaService listaService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public MiListaController(
            ListaService listaService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.listaService = listaService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<ListaResponse> listarMisListas() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return listaService.listarPorUsuario(idUsuario)
                .stream()
                .map(responseMapper::toListaResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ListaResponse> crearMiLista(
            @Valid @RequestBody CrearListaAutenticadaRequest request
    ) {
        Usuario usuario = usuarioAutenticadoService.obtenerUsuarioAutenticado();

        Lista listaCreada = listaService.crearListaParaUsuario(usuario, request);

        return ResponseEntity.ok(responseMapper.toListaResponse(listaCreada));
    }
}