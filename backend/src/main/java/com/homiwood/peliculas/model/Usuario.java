package com.homiwood.peliculas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 50, updatable = false)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 255)
    private String descripcion;

    @Column
    private Integer iconoPerfil = 1;

    @Column(length = 120)
    private String avatarPerfil;

    @Column(nullable = false)
    private Boolean perfilPrivado = false;

    @Column(nullable = false, length = 30)
    private String temaPerfil = "yellow";

    @Column(nullable = false, length = 20)
    private String portadaPerfil = "top1";

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getIconoPerfil() {
        return iconoPerfil;
    }

    public void setIconoPerfil(Integer iconoPerfil) {
        this.iconoPerfil = iconoPerfil;
    }

    public String getAvatarPerfil() {
        return avatarPerfil;
    }

    public void setAvatarPerfil(String avatarPerfil) {
        this.avatarPerfil = avatarPerfil;
    }

    public Boolean getPerfilPrivado() {
        return perfilPrivado;
    }

    public void setPerfilPrivado(Boolean perfilPrivado) {
        this.perfilPrivado = perfilPrivado;
    }

    public String getTemaPerfil() {
        return temaPerfil;
    }

    public void setTemaPerfil(String temaPerfil) {
        this.temaPerfil = temaPerfil;
    }

    public String getPortadaPerfil() {
        return portadaPerfil;
    }

    public void setPortadaPerfil(String portadaPerfil) {
        this.portadaPerfil = portadaPerfil;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}