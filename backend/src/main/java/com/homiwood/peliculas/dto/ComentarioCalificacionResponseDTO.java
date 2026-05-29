package com.homiwood.peliculas.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComentarioCalificacionResponseDTO {

    private Long idComentario;
    private Long idCalificacion;
    private Long idUsuario;
    private String username;
    private String texto;
    private LocalDateTime fechaComentario;
}