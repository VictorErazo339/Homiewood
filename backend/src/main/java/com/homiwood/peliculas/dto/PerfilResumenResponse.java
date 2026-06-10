package com.homiwood.peliculas.dto;

import java.util.List;

public class PerfilResumenResponse {

    private Long idUsuario;
    private String nombre;
    private String username;
    private String descripcion;
    private Integer iconoPerfil;
    private String avatarPerfil;
    private Boolean perfilPrivado;
    private String temaPerfil;
    private String portadaPerfil;

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

    public String getAvatarPerfil() {
        return avatarPerfil;
    }

    public void setAvatarPerfil(String avatarPerfil) {
        this.avatarPerfil = avatarPerfil;
    }

    public Boolean getPerfilPrivado() {
        return perfilPrivado;
    }

    public void setPerfilPrivado(Boolean perfilPrivado) {
        this.perfilPrivado = perfilPrivado;
    }

    public String getTemaPerfil() {
        return temaPerfil;
    }

    public void setTemaPerfil(String temaPerfil) {
        this.temaPerfil = temaPerfil;
    }

    public String getPortadaPerfil() {
        return portadaPerfil;
    }

    public void setPortadaPerfil(String portadaPerfil) {
        this.portadaPerfil = portadaPerfil;
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