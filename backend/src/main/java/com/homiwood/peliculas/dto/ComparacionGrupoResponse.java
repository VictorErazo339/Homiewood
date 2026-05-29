package com.homiwood.peliculas.dto;

import java.util.List;

public class ComparacionGrupoResponse {

    private Long idGrupo;
    private String nombreGrupo;
    private long totalMiembros;

    private List<ContenidoComparadoGrupoResponse> contenidoCompartido;
    private List<ContenidoComparadoGrupoResponse> paraVerJuntos;
    private List<ContenidoComparadoGrupoResponse> recomendacionesCruzadas;
    private List<ContenidoComparadoGrupoResponse> vistoPorTodos;

    public ComparacionGrupoResponse() {
    }

    public ComparacionGrupoResponse(
            Long idGrupo,
            String nombreGrupo,
            long totalMiembros,
            List<ContenidoComparadoGrupoResponse> contenidoCompartido,
            List<ContenidoComparadoGrupoResponse> paraVerJuntos,
            List<ContenidoComparadoGrupoResponse> recomendacionesCruzadas,
            List<ContenidoComparadoGrupoResponse> vistoPorTodos
    ) {
        this.idGrupo = idGrupo;
        this.nombreGrupo = nombreGrupo;
        this.totalMiembros = totalMiembros;
        this.contenidoCompartido = contenidoCompartido;
        this.paraVerJuntos = paraVerJuntos;
        this.recomendacionesCruzadas = recomendacionesCruzadas;
        this.vistoPorTodos = vistoPorTodos;
    }

    public Long getIdGrupo() {
        return idGrupo;
    }

    public void setIdGrupo(Long idGrupo) {
        this.idGrupo = idGrupo;
    }

    public String getNombreGrupo() {
        return nombreGrupo;
    }

    public void setNombreGrupo(String nombreGrupo) {
        this.nombreGrupo = nombreGrupo;
    }

    public long getTotalMiembros() {
        return totalMiembros;
    }

    public void setTotalMiembros(long totalMiembros) {
        this.totalMiembros = totalMiembros;
    }

    public List<ContenidoComparadoGrupoResponse> getContenidoCompartido() {
        return contenidoCompartido;
    }

    public void setContenidoCompartido(List<ContenidoComparadoGrupoResponse> contenidoCompartido) {
        this.contenidoCompartido = contenidoCompartido;
    }

    public List<ContenidoComparadoGrupoResponse> getParaVerJuntos() {
        return paraVerJuntos;
    }

    public void setParaVerJuntos(List<ContenidoComparadoGrupoResponse> paraVerJuntos) {
        this.paraVerJuntos = paraVerJuntos;
    }

    public List<ContenidoComparadoGrupoResponse> getRecomendacionesCruzadas() {
        return recomendacionesCruzadas;
    }

    public void setRecomendacionesCruzadas(List<ContenidoComparadoGrupoResponse> recomendacionesCruzadas) {
        this.recomendacionesCruzadas = recomendacionesCruzadas;
    }

    public List<ContenidoComparadoGrupoResponse> getVistoPorTodos() {
        return vistoPorTodos;
    }

    public void setVistoPorTodos(List<ContenidoComparadoGrupoResponse> vistoPorTodos) {
        this.vistoPorTodos = vistoPorTodos;
    }
}