package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record SeguimientoResponse(
        Long idSeguimiento,
        Long idSeguidor,
        String nombreSeguidor,
        String usernameSeguidor,
        Long idSeguido,
        String nombreSeguido,
        String usernameSeguido,
        LocalDateTime fechaSeguimiento
) {
}