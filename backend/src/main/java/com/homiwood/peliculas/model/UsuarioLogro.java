package com.homiwood.peliculas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "usuario_logros",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_usuario", "id_logro"})
        }
)
public class UsuarioLogro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_logro")
    private Long idUsuarioLogro;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_logro", nullable = false)
    private Logro logro;

    @Column(name = "progreso_actual", nullable = false)
    private Integer progresoActual = 0;

    @Column(name = "desbloqueado", nullable = false)
    private Boolean desbloqueado = false;

    @Column(name = "fecha_desbloqueo")
    private LocalDateTime fechaDesbloqueo;

    @Column(name = "destacado", nullable = false)
    private Boolean destacado = false;

    public Long getIdUsuarioLogro() {
        return idUsuarioLogro;
    }

    public void setIdUsuarioLogro(Long idUsuarioLogro) {
        this.idUsuarioLogro = idUsuarioLogro;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Logro getLogro() {
        return logro;
    }

    public void setLogro(Logro logro) {
        this.logro = logro;
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

    public LocalDateTime getFechaDesbloqueo() {
        return fechaDesbloqueo;
    }

    public void setFechaDesbloqueo(LocalDateTime fechaDesbloqueo) {
        this.fechaDesbloqueo = fechaDesbloqueo;
    }

    public Boolean getDestacado() {
        return destacado;
    }

    public void setDestacado(Boolean destacado) {
        this.destacado = destacado;
    }
}