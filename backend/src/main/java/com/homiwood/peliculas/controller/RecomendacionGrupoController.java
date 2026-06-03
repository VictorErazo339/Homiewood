package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.RecomendacionGrupoResponse;
import com.homiwood.peliculas.service.RecomendacionGrupoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionGrupoController {

    private final RecomendacionGrupoService recomendacionGrupoService;

    public RecomendacionGrupoController(RecomendacionGrupoService recomendacionGrupoService) {
        this.recomendacionGrupoService = recomendacionGrupoService;
    }

    @GetMapping("/grupo/{idGrupo}")
    public List<RecomendacionGrupoResponse> recomendarParaGrupo(
            @PathVariable Long idGrupo,
            @RequestParam(defaultValue = "10") int limite
    ) {
        return recomendacionGrupoService.recomendarParaGrupo(idGrupo, limite);
    }
}