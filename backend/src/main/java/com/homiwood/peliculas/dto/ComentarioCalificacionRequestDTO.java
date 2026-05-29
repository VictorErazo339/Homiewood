package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComentarioCalificacionRequestDTO {

    @NotNull
    private Long idCalificacion;

    @NotNull
    private Long idUsuario;

    @NotBlank
    private String texto;
}