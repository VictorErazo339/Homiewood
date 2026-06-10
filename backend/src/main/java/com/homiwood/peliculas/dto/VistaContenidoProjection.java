package com.homiwood.peliculas.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface VistaContenidoProjection {

    Long getIdListaContenido();

    Long getIdLista();

    Long getIdContenido();

    String getTitulo();

    String getTipoContenido();

    String getDescripcion();

    Integer getAnioEstreno();

    LocalDate getFechaEstreno();

    String getPosterUrl();

    String getIdioma();

    String getApiProvider();

    String getApiId();

    String getEstado();

    String getNotaUsuario();

    LocalDateTime getFechaAgregado();

    Long getIdCalificacion();

    Integer getPuntajeUsuario();

    String getComentarioUsuario();

    LocalDateTime getFechaCalificacion();

    String getGeneros();
}
