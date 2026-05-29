package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.AuthResponse;
import com.homiwood.peliculas.dto.LoginRequest;
import com.homiwood.peliculas.dto.RegisterRequest;
import com.homiwood.peliculas.dto.UsuarioResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.service.AuthService;
import com.homiwood.peliculas.service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ResponseMapper responseMapper;

    public AuthController(
            AuthService authService,
            UsuarioAutenticadoService usuarioAutenticadoService,
            ResponseMapper responseMapper
    ) {
        this.authService = authService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
        this.responseMapper = responseMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public UsuarioResponse obtenerUsuarioAutenticado() {
        return responseMapper.toUsuarioResponse(
                usuarioAutenticadoService.obtenerUsuarioAutenticado()
        );
    }
}