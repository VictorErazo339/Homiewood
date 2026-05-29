package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record CalificacionResponse(
        Long idCalificacion,
        Long idUsuario,
        String nombreUsuario,
        String username,
        Long idContenido,
        String tituloContenido,
        String tipoContenido,
        String posterUrl,
        Integer puntaje,
        String comentario,
        LocalDateTime fechaCalificacion
) {
}