package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public class ListaResponse {

    private Long idLista;
    private String titulo;
    private String descripcion;
    private String visibilidad;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    private Long idUsuario;
    private String nombreUsuario;
    private String username;

    public ListaResponse() {
    }

    public ListaResponse(
            Long idLista,
            String titulo,
            String descripcion,
            String visibilidad,
            LocalDateTime fechaCreacion,
            LocalDateTime fechaActualizacion,
            Long idUsuario,
            String nombreUsuario,
            String username
    ) {
        this.idLista = idLista;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.visibilidad = visibilidad;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.username = username;
    }

    public Long getIdLista() {
        return idLista;
    }

    public void setIdLista(Long idLista) {
        this.idLista = idLista;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getVisibilidad() {
        return visibilidad;
    }

    public void setVisibilidad(String visibilidad) {
        this.visibilidad = visibilidad;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}