package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public class ListaContenidoResponse {

    private Long idListaContenido;

    private Long idLista;
    private String tituloLista;

    private Long idContenido;
    private String tituloContenido;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;

    private Integer posicion;
    private String estado;
    private String notaUsuario;
    private LocalDateTime fechaAgregado;

    public ListaContenidoResponse() {
    }

    public ListaContenidoResponse(
            Long idListaContenido,
            Long idLista,
            String tituloLista,
            Long idContenido,
            String tituloContenido,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            Integer posicion,
            String estado,
            String notaUsuario,
            LocalDateTime fechaAgregado
    ) {
        this.idListaContenido = idListaContenido;
        this.idLista = idLista;
        this.tituloLista = tituloLista;
        this.idContenido = idContenido;
        this.tituloContenido = tituloContenido;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.posicion = posicion;
        this.estado = estado;
        this.notaUsuario = notaUsuario;
        this.fechaAgregado = fechaAgregado;
    }

    public Long getIdListaContenido() {
        return idListaContenido;
    }

    public void setIdListaContenido(Long idListaContenido) {
        this.idListaContenido = idListaContenido;
    }

    public Long getIdLista() {
        return idLista;
    }

    public void setIdLista(Long idLista) {
        this.idLista = idLista;
    }

    public String getTituloLista() {
        return tituloLista;
    }

    public void setTituloLista(String tituloLista) {
        this.tituloLista = tituloLista;
    }

    public Long getIdContenido() {
        return idContenido;
    }

    public void setIdContenido(Long idContenido) {
        this.idContenido = idContenido;
    }

    public String getTituloContenido() {
        return tituloContenido;
    }

    public void setTituloContenido(String tituloContenido) {
        this.tituloContenido = tituloContenido;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public Integer getAnioEstreno() {
        return anioEstreno;
    }

    public void setAnioEstreno(Integer anioEstreno) {
        this.anioEstreno = anioEstreno;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public Integer getPosicion() {
        return posicion;
    }

    public void setPosicion(Integer posicion) {
        this.posicion = posicion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotaUsuario() {
        return notaUsuario;
    }

    public void setNotaUsuario(String notaUsuario) {
        this.notaUsuario = notaUsuario;
    }

    public LocalDateTime getFechaAgregado() {
        return fechaAgregado;
    }

    public void setFechaAgregado(LocalDateTime fechaAgregado) {
        this.fechaAgregado = fechaAgregado;
    }
}