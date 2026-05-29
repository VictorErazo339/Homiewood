package com.homiwood.peliculas.dto;

public class RecomendacionGrupoResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;
    private Double promedioCalificaciones;

    private int miembrosInteresados;
    private int miembrosQueYaLaVieron;
    private long totalMiembros;

    private Double puntajeGrupo;
    private String motivo;

    public RecomendacionGrupoResponse() {
    }

    public RecomendacionGrupoResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            Double promedioCalificaciones,
            int miembrosInteresados,
            int miembrosQueYaLaVieron,
            long totalMiembros,
            Double puntajeGrupo,
            String motivo
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.promedioCalificaciones = promedioCalificaciones;
        this.miembrosInteresados = miembrosInteresados;
        this.miembrosQueYaLaVieron = miembrosQueYaLaVieron;
        this.totalMiembros = totalMiembros;
        this.puntajeGrupo = puntajeGrupo;
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

    public int getMiembrosInteresados() {
        return miembrosInteresados;
    }

    public void setMiembrosInteresados(int miembrosInteresados) {
        this.miembrosInteresados = miembrosInteresados;
    }

    public int getMiembrosQueYaLaVieron() {
        return miembrosQueYaLaVieron;
    }

    public void setMiembrosQueYaLaVieron(int miembrosQueYaLaVieron) {
        this.miembrosQueYaLaVieron = miembrosQueYaLaVieron;
    }

    public long getTotalMiembros() {
        return totalMiembros;
    }

    public void setTotalMiembros(long totalMiembros) {
        this.totalMiembros = totalMiembros;
    }

    public Double getPuntajeGrupo() {
        return puntajeGrupo;
    }

    public void setPuntajeGrupo(Double puntajeGrupo) {
        this.puntajeGrupo = puntajeGrupo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}