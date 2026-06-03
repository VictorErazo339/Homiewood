package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ComparacionGrupoResponse;
import com.homiwood.peliculas.service.ComparacionGrupoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparaciones")
public class ComparacionGrupoController {

    private final ComparacionGrupoService comparacionGrupoService;

    public ComparacionGrupoController(ComparacionGrupoService comparacionGrupoService) {
        this.comparacionGrupoService = comparacionGrupoService;
    }

    @GetMapping("/grupos/{idGrupo}")
    public ComparacionGrupoResponse compararGrupo(@PathVariable Long idGrupo) {
        return comparacionGrupoService.compararGrupo(idGrupo);
    }
}