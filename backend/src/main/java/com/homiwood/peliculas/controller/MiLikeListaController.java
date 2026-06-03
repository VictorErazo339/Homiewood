package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearLikeListaRequest;
import com.homiwood.peliculas.dto.LikeListaResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.LikeLista;
import com.homiwood.peliculas.service.LikeListaService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MiLikeListaController {

    private final LikeListaService likeListaService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public MiLikeListaController(
            LikeListaService likeListaService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.likeListaService = likeListaService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/listas/{idLista}/likes")
    public ResponseEntity<LikeListaResponse> darLikeAMiNombre(
            @PathVariable Long idLista
    ) {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        CrearLikeListaRequest request = new CrearLikeListaRequest();
        request.setIdUsuario(idUsuario);

        LikeLista like = likeListaService.darLike(idLista, request);

        return ResponseEntity.ok(responseMapper.toLikeListaResponse(like));
    }

    @DeleteMapping("/listas/{idLista}/likes")
    public ResponseEntity<String> quitarMiLike(
            @PathVariable Long idLista
    ) {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        likeListaService.quitarLike(idLista, idUsuario);

        return ResponseEntity.ok("Like eliminado correctamente");
    }

    @GetMapping("/likes")
    public List<LikeListaResponse> listarMisLikes() {
        Long idUsuario = usuarioAutenticadoService.obtenerIdUsuarioAutenticado();

        return likeListaService.listarLikesDeUsuario(idUsuario)
                .stream()
                .map(responseMapper::toLikeListaResponse)
                .toList();
    }
}