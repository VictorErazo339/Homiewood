package com.homiwood.peliculas.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JikanImageFormatDto {

    @JsonProperty("image_url")
    private String imageUrl;

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}