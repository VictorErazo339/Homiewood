package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.repository.GeneroLogroProjection;
import com.homiwood.peliculas.service.ContenidoGeneroService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoLogroGeneroController {

    private final ContenidoGeneroService contenidoGeneroService;

    public CatalogoLogroGeneroController(
            ContenidoGeneroService contenidoGeneroService
    ) {
        this.contenidoGeneroService = contenidoGeneroService;
    }

    @GetMapping("/usuario/{idUsuario}/estadisticas-logros-generos")
    public Map<String, Object> obtenerEstadisticasLogrosGeneros(
            @PathVariable Long idUsuario
    ) {
        List<Map<String, Object>> topGeneros = contenidoGeneroService
                .obtenerResumenGenerosUsuario(idUsuario)
                .stream()
                .map(this::toMap)
                .toList();

        return Map.of(
                "generosDistintosVistos", contenidoGeneroService.contarGenerosDistintosVistosUsuario(idUsuario),
                "exploradorGeneros", contenidoGeneroService.esExploradorGeneros(idUsuario),

                "romanceVistos", contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "romance"),
                "fanRomance", contenidoGeneroService.esFanRomance(idUsuario),

                "dramaVistos", contenidoGeneroService.contarVistosPorGeneroSimilar(idUsuario, "drama"),
                "fanDrama", contenidoGeneroService.esFanDrama(idUsuario),

                "fanAccion", contenidoGeneroService.esFanAccion(idUsuario),
                "fanComedia", contenidoGeneroService.esFanComedia(idUsuario),

                "topGeneros", topGeneros
        );
    }

    private Map<String, Object> toMap(GeneroLogroProjection projection) {
        return Map.of(
                "genero", projection.getGenero(),
                "cantidadVistos", projection.getCantidadVistos(),
                "peso", projection.getPeso()
        );
    }
}