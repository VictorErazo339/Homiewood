package com.homiwood.peliculas.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record VistaContenidoResponse(
        Long idListaContenido,
        Long idLista,
        Long idContenido,
        String titulo,
        String tipoContenido,
        String descripcion,
        Integer anioEstreno,
        LocalDate fechaEstreno,
        String posterUrl,
        String idioma,
        String apiProvider,
        String apiId,
        String estado,
        String notaUsuario,
        LocalDateTime fechaAgregado,
        Long idCalificacion,
        Integer puntajeUsuario,
        String comentarioUsuario,
        LocalDateTime fechaCalificacion,
        List<String> generos
) {
}
