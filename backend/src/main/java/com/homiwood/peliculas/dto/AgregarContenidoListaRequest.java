package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import lombok.Data;


@Data
public class AgregarContenidoListaRequest {

    @NotNull(message = "El idContenido es obligatorio")
    private Long idContenido;

    @Positive(message = "La posición debe ser mayor a 0")
    private Integer posicion;

    @Pattern(
            regexp = "POR_VER|VIENDO|VISTO|ABANDONADO|FAVORITO",
            message = "El estado debe ser POR_VER, VIENDO, VISTO, ABANDONADO o FAVORITO"
    )
    private String estado;

    @Size(max = 1000, message = "La nota no puede superar los 1000 caracteres")


    private String notaUsuario;

    public Long getIdContenido() {
        return idContenido;
    }

    public void setIdContenido(Long idContenido) {
        this.idContenido = idContenido;
    }

    public Integer getPosicion() {
        return posicion;
    }

    public void setPosicion(Integer posicion) {
        this.posicion = posicion;
    }

    public String getEstado() {return estado;}







}