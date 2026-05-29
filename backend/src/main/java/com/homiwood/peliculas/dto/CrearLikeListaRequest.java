package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotNull;

public class CrearLikeListaRequest {

    @NotNull(message = "El idUsuario es obligatorio")
    private Long idUsuario;

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
}