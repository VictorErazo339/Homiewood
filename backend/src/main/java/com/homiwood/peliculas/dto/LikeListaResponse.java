package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record LikeListaResponse(
        Long idLike,
        Long idUsuario,
        String nombreUsuario,
        String username,
        Long idLista,
        String tituloLista,
        LocalDateTime fechaLike
) {
}