package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CatalogoExternoResponse;
import com.homiwood.peliculas.dto.JikanAnimeDto;
import com.homiwood.peliculas.dto.JikanSearchResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
public class JikanCatalogoService {

    private final RestClient restClient;

    public JikanCatalogoService(@Value("${jikan.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("accept", "application/json")
                .build();
    }

    public List<CatalogoExternoResponse> buscarAnime(String query) {

        if (query == null || query.isBlank()) {
            throw new BadRequestException("El parámetro query es obligatorio");
        }

        try {
            JikanSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/anime")
                            .queryParam("q", query)
                            .queryParam("limit", 10)
                            .build()
                    )
                    .retrieve()
                    .body(JikanSearchResponse.class);

            if (response == null || response.getData() == null) {
                return List.of();
            }

            return response.getData()
                    .stream()
                    .map(this::mapearJikan)
                    .toList();

        } catch (RestClientException e) {
            return List.of();
        }
    }

    private CatalogoExternoResponse mapearJikan(JikanAnimeDto anime) {
        String posterUrl = null;

        if (anime.getImages() != null &&
                anime.getImages().getJpg() != null) {
            posterUrl = anime.getImages().getJpg().getImageUrl();
        }

        String fechaEstreno = null;

        if (anime.getAired() != null) {
            fechaEstreno = anime.getAired().getFrom();
        }

        return new CatalogoExternoResponse(
                "JIKAN",
                String.valueOf(anime.getMalId()),
                anime.getTituloFinal(),
                "SERIE",
                anime.getSynopsis(),
                fechaEstreno,
                anime.getYear(),
                posterUrl,
                "ja",
                anime.getScore()
        );
    }
}