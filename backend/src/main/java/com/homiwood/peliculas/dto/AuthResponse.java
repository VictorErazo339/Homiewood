package com.homiwood.peliculas.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UsuarioResponse usuario
) {
}