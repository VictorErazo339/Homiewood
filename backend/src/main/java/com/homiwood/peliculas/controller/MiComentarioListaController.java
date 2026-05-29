package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ComentarioListaResponse;
import com.homiwood.peliculas.dto.CrearComentarioAutenticadoRequest;
import com.homiwood.peliculas.dto.CrearComentarioListaRequest;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.ComentarioLista;
import com.homiwood.peliculas.service.ComentarioListaService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MiComentarioListaController {

    private final ComentarioListaService comentarioListaService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public MiComentarioListaController(
            ComentarioListaService comentarioListaService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.comentarioListaService = comentarioListaService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/listas/{idLista}/comentarios")
    public ResponseEntity<ComentarioListaResponse> comentarLista(
            @PathVariable Long idLista,
            @Valid @RequestBody CrearComentarioAutenticadoRequest request
    ) {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        CrearComentarioListaRequest crearRequest = new CrearComentarioListaRequest();
        crearRequest.setIdUsuario(idUsuario);
        crearRequest.setComentario(request.getComentario());

        ComentarioLista comentario = comentarioListaService.crearComentario(idLista, crearRequest);

        return ResponseEntity.ok(responseMapper.toComentarioListaResponse(comentario));
    }

    @GetMapping("/comentarios")
    public List<ComentarioListaResponse> listarMisComentarios() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return comentarioListaService.listarComentariosDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toComentarioListaResponse)
                .toList();
    }
}