package com.homiwood.peliculas.dto;

import java.util.Map;

public class ContenidoComparadoGrupoResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;

    private long totalMiembros;
    private int miembrosQueLoTienen;
    private int miembrosInteresados;
    private int miembrosQueYaLaVieron;
    private int miembrosSinContenido;

    private Map<Long, String> estadosPorUsuario;
    private Map<Long, String> nombresPorUsuario;

    private String motivo;

    public ContenidoComparadoGrupoResponse() {
    }

    public ContenidoComparadoGrupoResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            long totalMiembros,
            int miembrosQueLoTienen,
            int miembrosInteresados,
            int miembrosQueYaLaVieron,
            int miembrosSinContenido,
            Map<Long, String> estadosPorUsuario,
            Map<Long, String> nombresPorUsuario,
            String motivo
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.totalMiembros = totalMiembros;
        this.miembrosQueLoTienen = miembrosQueLoTienen;
        this.miembrosInteresados = miembrosInteresados;
        this.miembrosQueYaLaVieron = miembrosQueYaLaVieron;
        this.miembrosSinContenido = miembrosSinContenido;
        this.estadosPorUsuario = estadosPorUsuario;
        this.nombresPorUsuario = nombresPorUsuario;
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

    public long getTotalMiembros() {
        return totalMiembros;
    }

    public void setTotalMiembros(long totalMiembros) {
        this.totalMiembros = totalMiembros;
    }

    public int getMiembrosQueLoTienen() {
        return miembrosQueLoTienen;
    }

    public void setMiembrosQueLoTienen(int miembrosQueLoTienen) {
        this.miembrosQueLoTienen = miembrosQueLoTienen;
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

    public int getMiembrosSinContenido() {
        return miembrosSinContenido;
    }

    public void setMiembrosSinContenido(int miembrosSinContenido) {
        this.miembrosSinContenido = miembrosSinContenido;
    }

    public Map<Long, String> getEstadosPorUsuario() {
        return estadosPorUsuario;
    }

    public void setEstadosPorUsuario(Map<Long, String> estadosPorUsuario) {
        this.estadosPorUsuario = estadosPorUsuario;
    }

    public Map<Long, String> getNombresPorUsuario() {
        return nombresPorUsuario;
    }

    public void setNombresPorUsuario(Map<Long, String> nombresPorUsuario) {
        this.nombresPorUsuario = nombresPorUsuario;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}