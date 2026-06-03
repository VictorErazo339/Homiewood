package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearLikeListaRequest;
import com.homiwood.peliculas.dto.LikeListaResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.LikeLista;
import com.homiwood.peliculas.service.LikeListaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LikeListaController {

    private final LikeListaService likeListaService;
    private final ResponseMapper responseMapper;

    public LikeListaController(
            LikeListaService likeListaService,
            ResponseMapper responseMapper
    ) {
        this.likeListaService = likeListaService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/listas/{idLista}/likes")
    public ResponseEntity<LikeListaResponse> darLike(
            @PathVariable Long idLista,
            @Valid @RequestBody CrearLikeListaRequest request
    ) {
        LikeLista likeCreado = likeListaService.darLike(idLista, request);
        return ResponseEntity.ok(responseMapper.toLikeListaResponse(likeCreado));
    }

    @DeleteMapping("/listas/{idLista}/likes/usuario/{idUsuario}")
    public ResponseEntity<String> quitarLike(
            @PathVariable Long idLista,
            @PathVariable Long idUsuario
    ) {
        likeListaService.quitarLike(idLista, idUsuario);
        return ResponseEntity.ok("Like eliminado correctamente");
    }

    @GetMapping("/listas/{idLista}/likes")
    public List<LikeListaResponse> listarLikesDeLista(@PathVariable Long idLista) {
        return likeListaService.listarLikesDeLista(idLista)
                .stream()
                .map(responseMapper::toLikeListaResponse)
                .toList();
    }

    @GetMapping("/listas/{idLista}/likes/cantidad")
    public long contarLikesDeLista(@PathVariable Long idLista) {
        return likeListaService.contarLikesDeLista(idLista);
    }

    @GetMapping("/usuarios/{idUsuario}/likes")
    public List<LikeListaResponse> listarLikesDeUsuario(@PathVariable Long idUsuario) {
        return likeListaService.listarLikesDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toLikeListaResponse)
                .toList();
    }
}