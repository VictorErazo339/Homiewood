package com.homiwood.peliculas.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JikanAnimeDto {

    @JsonProperty("mal_id")
    private Long malId;

    private String title;

    @JsonProperty("title_english")
    private String titleEnglish;

    private String synopsis;
    private Integer year;
    private String type;
    private Integer episodes;
    private Double score;
    private String rating;
    private JikanImagesDto images;
    private JikanAiredDto aired;

    public Long getMalId() {
        return malId;
    }

    public String getTitle() {
        return title;
    }

    public String getTitleEnglish() {
        return titleEnglish;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public Integer getYear() {
        return year;
    }

    public String getType() {
        return type;
    }

    public Integer getEpisodes() {
        return episodes;
    }

    public Double getScore() {
        return score;
    }

    public String getRating() {
        return rating;
    }

    public JikanImagesDto getImages() {
        return images;
    }

    public JikanAiredDto getAired() {
        return aired;
    }

    public String getTituloFinal() {
        return titleEnglish != null && !titleEnglish.isBlank() ? titleEnglish : title;
    }
}