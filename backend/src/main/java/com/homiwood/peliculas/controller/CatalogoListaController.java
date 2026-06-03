package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.GuardarYAgregarContenidoRequest;
import com.homiwood.peliculas.dto.ListaContenidoResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.service.CatalogoListaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/listas")
public class CatalogoListaController {

    private final CatalogoListaService catalogoListaService;
    private final ResponseMapper responseMapper;

    public CatalogoListaController(
            CatalogoListaService catalogoListaService,
            ResponseMapper responseMapper
    ) {
        this.catalogoListaService = catalogoListaService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/{idLista}/contenidos/externo")
    public ResponseEntity<ListaContenidoResponse> guardarYAgregarContenido(
            @PathVariable Long idLista,
            @Valid @RequestBody GuardarYAgregarContenidoRequest request
    ) {
        ListaContenido resultado = catalogoListaService.guardarYAgregarALista(idLista, request);
        return ResponseEntity.ok(responseMapper.toListaContenidoResponse(resultado));
    }
}