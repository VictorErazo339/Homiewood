package com.homiwood.peliculas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "grupo_miembros",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_grupo", "id_usuario"})
        }
)
public class GrupoMiembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo_miembro")
    private Long idGrupoMiembro;

    @ManyToOne
    @JoinColumn(name = "id_grupo", nullable = false)
    private Grupo grupo;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "rol", nullable = false, length = 30)
    private String rol = "MIEMBRO";

    @Column(name = "fecha_union")
    private LocalDateTime fechaUnion = LocalDateTime.now();

    public Long getIdGrupoMiembro() {
        return idGrupoMiembro;
    }

    public void setIdGrupoMiembro(Long idGrupoMiembro) {
        this.idGrupoMiembro = idGrupoMiembro;
    }

    public Grupo getGrupo() {
        return grupo;
    }

    public void setGrupo(Grupo grupo) {
        this.grupo = grupo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public LocalDateTime getFechaUnion() {
        return fechaUnion;
    }

    public void setFechaUnion(LocalDateTime fechaUnion) {
        this.fechaUnion = fechaUnion;
    }
}