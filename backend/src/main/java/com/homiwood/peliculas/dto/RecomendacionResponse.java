package com.homiwood.peliculas.dto;

import java.util.ArrayList;
import java.util.List;

public class RecomendacionResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;
    private Double promedioCalificaciones;
    private String motivo;

    private List<String> generos = new ArrayList<>();
    private String idioma;
    private String descripcion;
    private String apiProvider;
    private String apiId;

    public RecomendacionResponse() {
    }

    public RecomendacionResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            Double promedioCalificaciones,
            String motivo,
            List<String> generos,
            String idioma,
            String descripcion,
            String apiProvider,
            String apiId
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.promedioCalificaciones = promedioCalificaciones;
        this.motivo = motivo;
        this.generos = generos != null ? generos : new ArrayList<>();
        this.idioma = idioma;
        this.descripcion = descripcion;
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

    public Double getPromedioCalificaciones() {
        return promedioCalificaciones;
    }

    public void setPromedioCalificaciones(Double promedioCalificaciones) {
        this.promedioCalificaciones = promedioCalificaciones;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public List<String> getGeneros() {
        return generos;
    }

    public void setGeneros(List<String> generos) {
        this.generos = generos != null ? generos : new ArrayList<>();
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
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