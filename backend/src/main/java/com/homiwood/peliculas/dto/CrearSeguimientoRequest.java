package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotNull;

public class CrearSeguimientoRequest {

    @NotNull(message = "El idSeguidor es obligatorio")
    private Long idSeguidor;

    public Long getIdSeguidor() {
        return idSeguidor;
    }

    public void setIdSeguidor(Long idSeguidor) {
        this.idSeguidor = idSeguidor;
    }
}