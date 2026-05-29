package com.homiwood.peliculas.dto;

public class RecomendacionResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;
    private Double promedioCalificaciones;
    private String motivo;

    public RecomendacionResponse() {
    }

    public RecomendacionResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            Double promedioCalificaciones,
            String motivo
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.promedioCalificaciones = promedioCalificaciones;
        this.motivo = motivo;
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
}