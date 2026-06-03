package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearListaRequest;
import com.homiwood.peliculas.dto.ListaResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.service.ListaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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