package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CatalogoExternoResponse;
import com.homiwood.peliculas.service.JikanCatalogoService;
import com.homiwood.peliculas.service.TmdbCatalogoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class CatalogoExternoController {

    private final TmdbCatalogoService tmdbCatalogoService;
    private final JikanCatalogoService jikanCatalogoService;

    public CatalogoExternoController(
            TmdbCatalogoService tmdbCatalogoService,
            JikanCatalogoService jikanCatalogoService
    ) {
        this.tmdbCatalogoService = tmdbCatalogoService;
        this.jikanCatalogoService = jikanCatalogoService;
    }

    @GetMapping("/api/catalogo/tmdb")
    public List<CatalogoExternoResponse> buscarEnTmdb(@RequestParam String query) {
        return tmdbCatalogoService.buscarPeliculasYSeries(query);
    }

    @GetMapping("/api/catalogo/anime")
    public List<CatalogoExternoResponse> buscarAnime(@RequestParam String query) {
        return jikanCatalogoService.buscarAnime(query);
    }

    @GetMapping("/api/catalogo/buscar")
    public List<CatalogoExternoResponse> buscarEnTodo(
            @RequestParam String query,
            @RequestParam(defaultValue = "true") boolean incluirAnime
    ) {
        List<CatalogoExternoResponse> resultados = new ArrayList<>();

        resultados.addAll(tmdbCatalogoService.buscarPeliculasYSeries(query));

        if (incluirAnime) {
            resultados.addAll(jikanCatalogoService.buscarAnime(query));
        }

        return resultados;
    }
}