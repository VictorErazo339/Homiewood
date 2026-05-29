package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ContenidoResponse;
import com.homiwood.peliculas.dto.GuardarContenidoExternoRequest;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.service.CatalogoGuardarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoGuardarController {

    private final CatalogoGuardarService catalogoGuardarService;
    private final ResponseMapper responseMapper;

    public CatalogoGuardarController(
            CatalogoGuardarService catalogoGuardarService,
            ResponseMapper responseMapper
    ) {
        this.catalogoGuardarService = catalogoGuardarService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/guardar")
    public ResponseEntity<ContenidoResponse> guardarContenidoExterno(
            @Valid @RequestBody GuardarContenidoExternoRequest request
    ) {
        Contenido contenidoGuardado = catalogoGuardarService.guardarContenidoExterno(request);
        return ResponseEntity.ok(responseMapper.toContenidoResponse(contenidoGuardado));
    }
}