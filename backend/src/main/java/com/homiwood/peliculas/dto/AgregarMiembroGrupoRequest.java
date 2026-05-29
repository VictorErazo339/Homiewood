package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class AgregarMiembroGrupoRequest {

    @NotNull(message = "El idUsuario es obligatorio")
    private Long idUsuario;

    @Pattern(
            regexp = "^$|ADMIN|MIEMBRO",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "El rol debe ser ADMIN o MIEMBRO"
    )
    private String rol;

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}