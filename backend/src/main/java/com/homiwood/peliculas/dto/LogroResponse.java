package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public class LogroResponse {

    private Long idLogro;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String icono;
    private String dificultad;
    private Integer valorObjetivo;
    private Integer progresoActual;
    private Boolean desbloqueado;
    private Boolean destacado;
    private Boolean oculto;
    private Boolean visible;
    private LocalDateTime fechaDesbloqueo;

    public Long getIdLogro() {
        return idLogro;
    }

    public void setIdLogro(Long idLogro) {
        this.idLogro = idLogro;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }

    public Integer getValorObjetivo() {
        return valorObjetivo;
    }

    public void setValorObjetivo(Integer valorObjetivo) {
        this.valorObjetivo = valorObjetivo;
    }

    public Integer getProgresoActual() {
        return progresoActual;
    }

    public void setProgresoActual(Integer progresoActual) {
        this.progresoActual = progresoActual;
    }

    public Boolean getDesbloqueado() {
        return desbloqueado;
    }

    public void setDesbloqueado(Boolean desbloqueado) {
        this.desbloqueado = desbloqueado;
    }

    public Boolean getDestacado() {
        return destacado;
    }

    public void setDestacado(Boolean destacado) {
        this.destacado = destacado;
    }

    public Boolean getOculto() {
        return oculto;
    }

    public void setOculto(Boolean oculto) {
        this.oculto = oculto;
    }

    public Boolean getVisible() {
        return visible;
    }

    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public LocalDateTime getFechaDesbloqueo() {
        return fechaDesbloqueo;
    }

    public void setFechaDesbloqueo(LocalDateTime fechaDesbloqueo) {
        this.fechaDesbloqueo = fechaDesbloqueo;
    }
}