package com.homiwood.peliculas.dto;

import java.util.List;

public class PerfilResumenResponse {

    private Long idUsuario;
    private String nombre;
    private String username;
    private String descripcion;
    private Integer iconoPerfil;
    private Boolean perfilPrivado;

    private Long cantidadPosts;
    private Long cantidadSeguidores;
    private Long cantidadSiguiendo;

    private List<LogroResponse> logrosDestacados;

    public PerfilResumenResponse() {
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getIconoPerfil() {
        return iconoPerfil;
    }

    public void setIconoPerfil(Integer iconoPerfil) {
        this.iconoPerfil = iconoPerfil;
    }

    public Boolean getPerfilPrivado() {
        return perfilPrivado;
    }

    public void setPerfilPrivado(Boolean perfilPrivado) {
        this.perfilPrivado = perfilPrivado;
    }

    public Long getCantidadPosts() {
        return cantidadPosts;
    }

    public void setCantidadPosts(Long cantidadPosts) {
        this.cantidadPosts = cantidadPosts;
    }

    public Long getCantidadSeguidores() {
        return cantidadSeguidores;
    }

    public void setCantidadSeguidores(Long cantidadSeguidores) {
        this.cantidadSeguidores = cantidadSeguidores;
    }

    public Long getCantidadSiguiendo() {
        return cantidadSiguiendo;
    }

    public void setCantidadSiguiendo(Long cantidadSiguiendo) {
        this.cantidadSiguiendo = cantidadSiguiendo;
    }

    public List<LogroResponse> getLogrosDestacados() {
        return logrosDestacados;
    }

    public void setLogrosDestacados(List<LogroResponse> logrosDestacados) {
        this.logrosDestacados = logrosDestacados;
    }
}