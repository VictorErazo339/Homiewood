package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.RecomendacionResponse;
import com.homiwood.peliculas.service.RecomendacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionController {

    private final RecomendacionService recomendacionService;

    public RecomendacionController(RecomendacionService recomendacionService) {
        this.recomendacionService = recomendacionService;
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<RecomendacionResponse> recomendarParaUsuario(
            @PathVariable Long idUsuario,
            @RequestParam(defaultValue = "10") int limite
    ) {
        return recomendacionService.recomendarParaUsuario(idUsuario, limite);
    }

    @GetMapping("/usuario/{idUsuario}/desde/{idOtroUsuario}")
    public List<RecomendacionResponse> recomendarDesdeOtroUsuario(
            @PathVariable Long idUsuario,
            @PathVariable Long idOtroUsuario,
            @RequestParam(defaultValue = "10") int limite
    ) {
        return recomendacionService.recomendarDesdeOtroUsuario(idUsuario, idOtroUsuario, limite);
    }
}