package com.homiwood.peliculas.dto;

import java.util.List;

public class ComparacionUsuariosResponse {

    private Long idUsuario1;
    private Long idUsuario2;

    private List<ContenidoComparadoResponse> contenidoEnComun;
    private List<ContenidoComparadoResponse> paraVerJuntos;
    private List<ContenidoComparadoResponse> recomendacionesParaUsuario1;
    private List<ContenidoComparadoResponse> recomendacionesParaUsuario2;
    private List<ContenidoComparadoResponse> ambosYaVieron;

    public ComparacionUsuariosResponse() {
    }

    public ComparacionUsuariosResponse(
            Long idUsuario1,
            Long idUsuario2,
            List<ContenidoComparadoResponse> contenidoEnComun,
            List<ContenidoComparadoResponse> paraVerJuntos,
            List<ContenidoComparadoResponse> recomendacionesParaUsuario1,
            List<ContenidoComparadoResponse> recomendacionesParaUsuario2,
            List<ContenidoComparadoResponse> ambosYaVieron
    ) {
        this.idUsuario1 = idUsuario1;
        this.idUsuario2 = idUsuario2;
        this.contenidoEnComun = contenidoEnComun;
        this.paraVerJuntos = paraVerJuntos;
        this.recomendacionesParaUsuario1 = recomendacionesParaUsuario1;
        this.recomendacionesParaUsuario2 = recomendacionesParaUsuario2;
        this.ambosYaVieron = ambosYaVieron;
    }

    public Long getIdUsuario1() {
        return idUsuario1;
    }

    public void setIdUsuario1(Long idUsuario1) {
        this.idUsuario1 = idUsuario1;
    }

    public Long getIdUsuario2() {
        return idUsuario2;
    }

    public void setIdUsuario2(Long idUsuario2) {
        this.idUsuario2 = idUsuario2;
    }

    public List<ContenidoComparadoResponse> getContenidoEnComun() {
        return contenidoEnComun;
    }

    public void setContenidoEnComun(List<ContenidoComparadoResponse> contenidoEnComun) {
        this.contenidoEnComun = contenidoEnComun;
    }

    public List<ContenidoComparadoResponse> getParaVerJuntos() {
        return paraVerJuntos;
    }

    public void setParaVerJuntos(List<ContenidoComparadoResponse> paraVerJuntos) {
        this.paraVerJuntos = paraVerJuntos;
    }

    public List<ContenidoComparadoResponse> getRecomendacionesParaUsuario1() {
        return recomendacionesParaUsuario1;
    }

    public void setRecomendacionesParaUsuario1(List<ContenidoComparadoResponse> recomendacionesParaUsuario1) {
        this.recomendacionesParaUsuario1 = recomendacionesParaUsuario1;
    }

    public List<ContenidoComparadoResponse> getRecomendacionesParaUsuario2() {
        return recomendacionesParaUsuario2;
    }

    public void setRecomendacionesParaUsuario2(List<ContenidoComparadoResponse> recomendacionesParaUsuario2) {
        this.recomendacionesParaUsuario2 = recomendacionesParaUsuario2;
    }

    public List<ContenidoComparadoResponse> getAmbosYaVieron() {
        return ambosYaVieron;
    }

    public void setAmbosYaVieron(List<ContenidoComparadoResponse> ambosYaVieron) {
        this.ambosYaVieron = ambosYaVieron;
    }
}