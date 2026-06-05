package com.homiwood.peliculas.dto;

import java.util.List;

public class ActualizarLogrosDestacadosRequest {

    private List<Long> idsLogros;

    public List<Long> getIdsLogros() {
        return idsLogros;
    }

    public void setIdsLogros(List<Long> idsLogros) {
        this.idsLogros = idsLogros;
    }
}