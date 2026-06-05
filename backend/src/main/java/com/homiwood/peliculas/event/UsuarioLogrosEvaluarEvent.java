package com.homiwood.peliculas.event;

public class UsuarioLogrosEvaluarEvent {

    private final Long idUsuario;

    public UsuarioLogrosEvaluarEvent(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }
}