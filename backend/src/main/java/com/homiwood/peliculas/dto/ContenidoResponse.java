package com.homiwood.peliculas.dto;

import java.time.LocalDate;

public class ContenidoResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private String descripcion;
    private Integer anioEstreno;
    private LocalDate fechaEstreno;
    private Integer duracionMinutos;
    private String clasificacionEdad;
    private String posterUrl;
    private String pais;
    private String idioma;
    private String apiProvider;
    private String apiId;

    public ContenidoResponse() {
    }

    public ContenidoResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            String descripcion,
            Integer anioEstreno,
            LocalDate fechaEstreno,
            Integer duracionMinutos,
            String clasificacionEdad,
            String posterUrl,
            String pais,
            String idioma,
            String apiProvider,
            String apiId
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.descripcion = descripcion;
        this.anioEstreno = anioEstreno;
        this.fechaEstreno = fechaEstreno;
        this.duracionMinutos = duracionMinutos;
        this.clasificacionEdad = clasificacionEdad;
        this.posterUrl = posterUrl;
        this.pais = pais;
        this.idioma = idioma;
        this.apiProvider = apiProvider;
        this.apiId = apiId;
    }

    public Long getIdContenido() {
        return idContenido;
    }

    public void setIdContenido(Long idContenido) {
        this.idContenido = idContenido;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getAnioEstreno() {
        return anioEstreno;
    }

    public void setAnioEstreno(Integer anioEstreno) {
        this.anioEstreno = anioEstreno;
    }

    public LocalDate getFechaEstreno() {
        return fechaEstreno;
    }

    public void setFechaEstreno(LocalDate fechaEstreno) {
        this.fechaEstreno = fechaEstreno;
    }

    public Integer getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Integer duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getClasificacionEdad() {
        return clasificacionEdad;
    }

    public void setClasificacionEdad(String clasificacionEdad) {
        this.clasificacionEdad = clasificacionEdad;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public String getApiProvider() {
        return apiProvider;
    }

    public void setApiProvider(String apiProvider) {
        this.apiProvider = apiProvider;
    }

    public String getApiId() {
        return apiId;
    }

    public void setApiId(String apiId) {
        this.apiId = apiId;
    }
}