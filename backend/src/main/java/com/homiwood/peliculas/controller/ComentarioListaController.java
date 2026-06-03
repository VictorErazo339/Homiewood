package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ActualizarComentarioListaRequest;
import com.homiwood.peliculas.dto.ComentarioListaResponse;
import com.homiwood.peliculas.dto.CrearComentarioListaRequest;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.ComentarioLista;
import com.homiwood.peliculas.service.ComentarioListaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ComentarioListaController {

    private final ComentarioListaService comentarioListaService;
    private final ResponseMapper responseMapper;

    public ComentarioListaController(
            ComentarioListaService comentarioListaService,
            ResponseMapper responseMapper
    ) {
        this.comentarioListaService = comentarioListaService;
        this.responseMapper = responseMapper;
    }

    @GetMapping("/listas/{idLista}/comentarios")
    public List<ComentarioListaResponse> listarComentariosDeLista(@PathVariable Long idLista) {
        return comentarioListaService.listarComentariosDeLista(idLista)
                .stream()
                .map(responseMapper::toComentarioListaResponse)
                .toList();
    }

    @PostMapping("/listas/{idLista}/comentarios")
    public ResponseEntity<ComentarioListaResponse> crearComentario(
            @PathVariable Long idLista,
            @Valid @RequestBody CrearComentarioListaRequest request
    ) {
        ComentarioLista comentarioCreado = comentarioListaService.crearComentario(idLista, request);
        return ResponseEntity.ok(responseMapper.toComentarioListaResponse(comentarioCreado));
    }

    @PutMapping("/comentarios-lista/{idComentario}")
    public ResponseEntity<ComentarioListaResponse> actualizarComentario(
            @PathVariable Long idComentario,
            @Valid @RequestBody ActualizarComentarioListaRequest request
    ) {
        ComentarioLista comentarioActualizado =
                comentarioListaService.actualizarComentario(idComentario, request);

        return ResponseEntity.ok(responseMapper.toComentarioListaResponse(comentarioActualizado));
    }

    @DeleteMapping("/comentarios-lista/{idComentario}")
    public ResponseEntity<String> eliminarComentario(@PathVariable Long idComentario) {
        comentarioListaService.eliminarComentario(idComentario);
        return ResponseEntity.ok("Comentario eliminado correctamente");
    }

    @GetMapping("/usuarios/{idUsuario}/comentarios")
    public List<ComentarioListaResponse> listarComentariosDeUsuario(@PathVariable Long idUsuario) {
        return comentarioListaService.listarComentariosDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toComentarioListaResponse)
                .toList();
    }

    @GetMapping("/listas/{idLista}/comentarios/cantidad")
    public long contarComentariosDeLista(@PathVariable Long idLista) {
        return comentarioListaService.contarComentariosDeLista(idLista);
    }
}