package com.homiwood.peliculas.dto;

public class UsuarioSearchResponse {

    private Long idUsuario;
    private String nombre;
    private String username;
    private String descripcion;
    private Integer iconoPerfil;
    private Boolean perfilPrivado;

    public UsuarioSearchResponse() {
    }

    public UsuarioSearchResponse(
            Long idUsuario,
            String nombre,
            String username,
            String descripcion,
            Integer iconoPerfil,
            Boolean perfilPrivado
    ) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.username = username;
        this.descripcion = descripcion;
        this.iconoPerfil = iconoPerfil;
        this.perfilPrivado = perfilPrivado;
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
}