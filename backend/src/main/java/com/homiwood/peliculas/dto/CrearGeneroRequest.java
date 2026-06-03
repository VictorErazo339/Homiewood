package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CrearGeneroRequest {

    @NotBlank(message = "El nombre del género es obligatorio")
    @Size(max = 100, message = "El nombre del género no puede superar los 100 caracteres")
    private String nombre;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}