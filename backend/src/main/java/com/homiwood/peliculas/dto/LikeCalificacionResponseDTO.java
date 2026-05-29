package com.homiwood.peliculas.dto;

import com.homiwood.peliculas.model.LikeCalificacion;
import lombok.Data;

@Data
public class LikeCalificacionResponseDTO {

    private Long idCalificacion;
    private long totalLikes;
    private long totalDislikes;
    private LikeCalificacion.TipoLike tipoUsuario; // null si el usuario no votó
}