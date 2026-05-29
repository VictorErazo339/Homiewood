package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CatalogoExternoResponse;
import com.homiwood.peliculas.dto.TmdbItemDto;
import com.homiwood.peliculas.dto.TmdbSearchResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.util.zip.GZIPInputStream;
import java.nio.charset.StandardCharsets;

import java.util.List;

@Service
public class TmdbCatalogoService {

    private final RestClient restClient;
    private final String imageBaseUrl;

    public TmdbCatalogoService(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.token}") String token,
            @Value("${tmdb.image-base-url}") String imageBaseUrl
    ) {
        this.imageBaseUrl = imageBaseUrl;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + token)
                .defaultHeader("accept", "application/json")
                .defaultHeader("Accept-Encoding", "identity")
                .build();
    }

    public List<CatalogoExternoResponse> buscarPeliculasYSeries(String query) {

        if (query == null || query.isBlank()) {
            throw new BadRequestException("El parámetro query es obligatorio");
        }

        try {
            System.out.println("🔍 Buscando en TMDB: " + query);

            byte[] responseBytes = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/multi")
                            .queryParam("query", query)
                            .queryParam("language", "es-CL")
                            .queryParam("page", 1)
                            .queryParam("include_adult", false)
                            .build()
                    )
                    .retrieve()
                    .body(byte[].class);

            if (responseBytes == null) return List.of();

            // Detectar si está comprimido con gzip
            String json;
            if (responseBytes.length > 2 && responseBytes[0] == (byte) 0x1f && responseBytes[1] == (byte) 0x8b) {
                GZIPInputStream gzip = new GZIPInputStream(new ByteArrayInputStream(responseBytes));
                json = new String(gzip.readAllBytes(), StandardCharsets.UTF_8);
                System.out.println("📦 Respuesta descomprimida gzip");
            } else {
                json = new String(responseBytes, StandardCharsets.UTF_8);
            }

            ObjectMapper mapper = new ObjectMapper();
            TmdbSearchResponse response = mapper.readValue(json, TmdbSearchResponse.class);

            System.out.println("📦 Resultados: " + response.getResults().size());

            if (response.getResults() == null) return List.of();

            return response.getResults()
                    .stream()
                    .filter(item -> "movie".equals(item.getMediaType()) || "tv".equals(item.getMediaType()))
                    .map(this::mapearTmdb)
                    .toList();

        } catch (Exception e) {
            System.out.println("❌ Error TMDB: " + e.getMessage());
            System.out.println("❌ Causa: " + e.getCause());
            return List.of();
        }
    }

    private CatalogoExternoResponse mapearTmdb(TmdbItemDto item) {
        String tipoContenido = "movie".equals(item.getMediaType()) ? "PELICULA" : "SERIE";
        String posterUrl = item.getPosterPath() != null ? imageBaseUrl + item.getPosterPath() : null;

        return new CatalogoExternoResponse(
                "TMDB",
                String.valueOf(item.getId()),
                item.getTituloFinal(),
                tipoContenido,
                item.getOverview(),
                item.getFechaFinal(),
                obtenerAnio(item.getFechaFinal()),
                posterUrl,
                item.getOriginalLanguage(),
                item.getVoteAverage()
        );
    }

    private Integer obtenerAnio(String fecha) {
        if (fecha == null || fecha.length() < 4) {
            return null;
        }

        try {
            return Integer.parseInt(fecha.substring(0, 4));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}