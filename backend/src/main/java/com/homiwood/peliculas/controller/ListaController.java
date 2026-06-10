package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearListaRequest;
import com.homiwood.peliculas.dto.ListaResponse;
import com.homiwood.peliculas.dto.VistaContenidoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.service.ListaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listas")
public class ListaController {

    private final ListaService listaService;
    private final ResponseMapper responseMapper;

    public ListaController(ListaService listaService, ResponseMapper responseMapper) {
        this.listaService = listaService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<ListaResponse> listarListas() {
        return listaService.listarListas()
                .stream()
                .map(responseMapper::toListaResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ListaResponse buscarLista(@PathVariable Long id) {
        return responseMapper.toListaResponse(listaService.buscarPorId(id));
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<ListaResponse> listarPorUsuario(@PathVariable Long idUsuario) {
        return listaService.listarPorUsuario(idUsuario)
                .stream()
                .map(responseMapper::toListaResponse)
                .toList();
    }

    @GetMapping("/usuario/{idUsuario}/vistas")
    public List<VistaContenidoResponse> listarVistasUsuario(
            @PathVariable Long idUsuario,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String genero,
            @RequestParam(required = false) Integer puntaje,
            @RequestParam(defaultValue = "false") Boolean sinPuntaje,
            @RequestParam(required = false) Integer anio,
            @RequestParam(defaultValue = "RECIENTES") String orden,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int limite
    ) {
        return listaService.listarVistasUsuario(
                idUsuario,
                query,
                tipo,
                genero,
                puntaje,
                sinPuntaje,
                anio,
                orden,
                page,
                limite
        );
    }

    @PostMapping
    public ResponseEntity<ListaResponse> crearLista(@Valid @RequestBody CrearListaRequest request) {
        Lista listaCreada = listaService.crearLista(request);
        return ResponseEntity.ok(responseMapper.toListaResponse(listaCreada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarLista(@PathVariable Long id) {
        listaService.eliminarLista(id);
        return ResponseEntity.ok("Lista eliminada correctamente");
    }
}
