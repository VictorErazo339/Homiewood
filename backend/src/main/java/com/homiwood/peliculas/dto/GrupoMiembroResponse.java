package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public record GrupoMiembroResponse(
        Long idGrupoMiembro,
        Long idGrupo,
        String nombreGrupo,
        Long idUsuario,
        String nombreUsuario,
        String username,
        String rol,
        LocalDateTime fechaUnion
) {
}