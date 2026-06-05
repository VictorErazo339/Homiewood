package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ActualizarLogrosDestacadosRequest;
import com.homiwood.peliculas.dto.LogroResponse;
import com.homiwood.peliculas.service.LogroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class LogroController {

    private final LogroService logroService;

    public LogroController(LogroService logroService) {
        this.logroService = logroService;
    }

    @GetMapping("/{idUsuario}/logros")
    public List<LogroResponse> listarLogrosUsuario(
            @PathVariable Long idUsuario
    ) {
        return logroService.listarLogrosUsuario(idUsuario);
    }

    @GetMapping("/{idUsuario}/logros/destacados")
    public List<LogroResponse> listarLogrosDestacados(
            @PathVariable Long idUsuario
    ) {
        return logroService.listarLogrosDestacados(idUsuario);
    }

    @PutMapping("/{idUsuario}/logros/destacados")
    public ResponseEntity<List<LogroResponse>> actualizarLogrosDestacados(
            @PathVariable Long idUsuario,
            @RequestBody ActualizarLogrosDestacadosRequest request
    ) {
        return ResponseEntity.ok(
                logroService.actualizarLogrosDestacados(idUsuario, request)
        );
    }

    @PostMapping("/{idUsuario}/logros/evaluar")
    public ResponseEntity<String> evaluarLogrosUsuario(
            @PathVariable Long idUsuario
    ) {
        logroService.evaluarLogrosUsuario(idUsuario);
        return ResponseEntity.ok("Logros evaluados correctamente");
    }
}