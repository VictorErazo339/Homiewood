package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class ActualizarPerfilRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    private String descripcion;

    @Pattern(
            regexp = "yellow|crimson|blue|pink|purple|neon|sunset|mint|sage",
            message = "El tema de perfil no es válido"
    )
    private String temaPerfil;

    @Pattern(
            regexp = "top1|top2|top3|top4|top5|none",
            message = "La portada de perfil no es válida"
    )
    private String portadaPerfil;

    @Size(max = 120, message = "El avatar de perfil no puede superar los 120 caracteres")
    private String avatarPerfil;

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

    public String getAvatarPerfil() {
        return avatarPerfil;
    }

    public void setAvatarPerfil(String avatarPerfil) {
        this.avatarPerfil = avatarPerfil;
    }
}