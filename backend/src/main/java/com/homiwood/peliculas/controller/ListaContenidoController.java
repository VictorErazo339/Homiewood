package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.AgregarContenidoListaRequest;
import com.homiwood.peliculas.dto.ListaContenidoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.service.ListaContenidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listas")
public class ListaContenidoController {

    private final ListaContenidoService listaContenidoService;
    private final ResponseMapper responseMapper;

    public ListaContenidoController(
            ListaContenidoService listaContenidoService,
            ResponseMapper responseMapper
    ) {
        this.listaContenidoService = listaContenidoService;
        this.responseMapper = responseMapper;
    }

    @GetMapping("/{idLista}/contenidos")
    public List<ListaContenidoResponse> listarContenidoDeLista(
            @PathVariable Long idLista
    ) {
        return listaContenidoService.listarContenidoDeLista(idLista)
                .stream()
                .map(responseMapper::toListaContenidoResponse)
                .toList();
    }

    @PostMapping("/{idLista}/contenidos")
    public ResponseEntity<ListaContenidoResponse> agregarContenidoALista(
            @PathVariable Long idLista,
            @Valid @RequestBody AgregarContenidoListaRequest request
    ) {
        ListaContenido resultado =
                listaContenidoService.agregarContenidoALista(idLista, request);

        return ResponseEntity.ok(
                responseMapper.toListaContenidoResponse(resultado)
        );
    }

    @DeleteMapping("/contenidos/{idListaContenido}")
    public ResponseEntity<String> eliminarContenidoDeLista(
            @PathVariable Long idListaContenido
    ) {
        listaContenidoService.eliminarContenidoDeLista(idListaContenido);
        return ResponseEntity.ok("Contenido eliminado de la lista correctamente");
    }

    @DeleteMapping("/{idLista}/contenidos/{idContenido}")
    public ResponseEntity<Void> quitarContenidoDeLista(
            @PathVariable Long idLista,
            @PathVariable Long idContenido
    ) {
        listaContenidoService.quitarContenidoDeLista(idLista, idContenido);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{idLista}/posiciones/{posicion}")
    public ResponseEntity<Void> quitarContenidoPorPosicion(
            @PathVariable Long idLista,
            @PathVariable Integer posicion
    ) {
        listaContenidoService.quitarContenidoPorPosicion(idLista, posicion);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // ENDPOINT TEMPORAL PARA PROBAR LOGROS - PASO 2
    // =========================================================

    @GetMapping("/usuario/{idUsuario}/estadisticas-logros-listas")
    public Map<String, Object> obtenerEstadisticasLogrosListas(
            @PathVariable Long idUsuario
    ) {
        return Map.of(
                "totalVistos", listaContenidoService.contarVistosUsuario(idUsuario),
                "totalPorVer", listaContenidoService.contarPorVerUsuario(idUsuario),
                "totalTop5", listaContenidoService.contarTop5Usuario(idUsuario),
                "top5Completo", listaContenidoService.tieneTop5Completo(idUsuario),
                "vistosHoy", listaContenidoService.contarVistosHoyUsuario(idUsuario),
                "maratonistaHoy", listaContenidoService.esMaratonistaHoy(idUsuario),
                "peliculasVistas", listaContenidoService.contarPeliculasVistas(idUsuario),
                "seriesVistas", listaContenidoService.contarSeriesVistas(idUsuario),
                "animesVistos", listaContenidoService.contarAnimesVistos(idUsuario)
        );
    }
}