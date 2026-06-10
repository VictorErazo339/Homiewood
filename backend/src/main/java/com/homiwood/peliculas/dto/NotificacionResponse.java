package com.homiwood.peliculas.dto;

import java.time.LocalDateTime;

public class NotificacionResponse {

    private Long idNotificacion;
    private String tipo;
    private String titulo;
    private String mensaje;
    private String icono;
    private Boolean leida;
    private LocalDateTime fechaCreacion;

    public NotificacionResponse() {
    }

    public NotificacionResponse(
            Long idNotificacion,
            String tipo,
            String titulo,
            String mensaje,
            String icono,
            Boolean leida,
            LocalDateTime fechaCreacion
    ) {
        this.idNotificacion = idNotificacion;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.icono = icono;
        this.leida = leida;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getIdNotificacion() {
        return idNotificacion;
    }

    public void setIdNotificacion(Long idNotificacion) {
        this.idNotificacion = idNotificacion;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public Boolean getLeida() {
        return leida;
    }

    public void setLeida(Boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
