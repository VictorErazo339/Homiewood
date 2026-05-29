package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ComparacionUsuariosResponse;
import com.homiwood.peliculas.service.ComparacionUsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparaciones")
public class ComparacionUsuarioController {

    private final ComparacionUsuarioService comparacionUsuarioService;

    public ComparacionUsuarioController(ComparacionUsuarioService comparacionUsuarioService) {
        this.comparacionUsuarioService = comparacionUsuarioService;
    }

    @GetMapping("/usuarios/{idUsuario1}/{idUsuario2}")
    public ComparacionUsuariosResponse compararUsuarios(
            @PathVariable Long idUsuario1,
            @PathVariable Long idUsuario2
    ) {
        return comparacionUsuarioService.compararUsuarios(idUsuario1, idUsuario2);
    }
}