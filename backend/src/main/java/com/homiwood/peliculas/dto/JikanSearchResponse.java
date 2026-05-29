package com.homiwood.peliculas.dto;

import java.util.List;

public class JikanSearchResponse {

    private List<JikanAnimeDto> data;

    public List<JikanAnimeDto> getData() {
        return data;
    }

    public void setData(List<JikanAnimeDto> data) {
        this.data = data;
    }
}