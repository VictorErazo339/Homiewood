package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotNull;

public class AgregarGeneroContenidoRequest {

    @NotNull(message = "El idGenero es obligatorio")
    private Long idGenero;

    public Long getIdGenero() {
        return idGenero;
    }

    public void setIdGenero(Long idGenero) {
        this.idGenero = idGenero;
    }
}