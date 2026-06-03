package com.homiwood.peliculas.dto;

public record ContenidoGeneroResponse(
        Long idContenidoGenero,
        Long idContenido,
        String tituloContenido,
        Long idGenero,
        String nombreGenero
) {
}