package com.homiwood.peliculas.dto;

import com.homiwood.peliculas.model.LikeCalificacion;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LikeCalificacionRequestDTO {

    @NotNull
    private Long idCalificacion;

    @NotNull
    private Long idUsuario;

    @NotNull
    private LikeCalificacion.TipoLike tipo;
}