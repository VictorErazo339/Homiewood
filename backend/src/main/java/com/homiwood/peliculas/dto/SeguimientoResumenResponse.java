package com.homiwood.peliculas.dto;

public class SeguimientoResumenResponse {

    private Long idUsuario;
    private long seguidores;
    private long siguiendo;
    private boolean loSigo;

    public SeguimientoResumenResponse() {
    }

    public SeguimientoResumenResponse(Long idUsuario, long seguidores, long siguiendo, boolean loSigo) {
        this.idUsuario = idUsuario;
        this.seguidores = seguidores;
        this.siguiendo = siguiendo;
        this.loSigo = loSigo;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public long getSeguidores() {
        return seguidores;
    }

    public void setSeguidores(long seguidores) {
        this.seguidores = seguidores;
    }

    public long getSiguiendo() {
        return siguiendo;
    }

    public void setSiguiendo(long siguiendo) {
        this.siguiendo = siguiendo;
    }

    public boolean isLoSigo() {
        return loSigo;
    }

    public void setLoSigo(boolean loSigo) {
        this.loSigo = loSigo;
    }
}