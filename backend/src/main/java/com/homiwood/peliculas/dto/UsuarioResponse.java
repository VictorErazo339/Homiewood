package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public class UsuarioResponse {

    private Long idUsuario;
    private String nombre;
    private String username;
    private String email;
    private String descripcion;
    private LocalDateTime fechaCreacion;

    public UsuarioResponse() {
    }

    public UsuarioResponse(Long idUsuario, String nombre, String username, String email, LocalDateTime fechaCreacion) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.username = username;
        this.email = email;
        this.fechaCreacion = fechaCreacion;
    }

    public UsuarioResponse(Long idUsuario, String nombre, String username, String email, String descripcion, LocalDateTime fechaCreacion) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.username = username;
        this.email = email;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}