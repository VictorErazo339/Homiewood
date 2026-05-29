package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record GrupoResponse(
        Long idGrupo,
        String nombre,
        String descripcion,
        Long idCreador,
        String nombreCreador,
        String usernameCreador,
        LocalDateTime fechaCreacion
) {
}