package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record ComentarioListaResponse(
        Long idComentario,
        Long idLista,
        String tituloLista,
        Long idUsuario,
        String nombreUsuario,
        String username,
        String comentario,
        LocalDateTime fechaComentario,
        LocalDateTime fechaActualizacion
) {
}