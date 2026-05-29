package com.homiwood.peliculas.dto;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CrearContenidoRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar los 200 caracteres")
    private String titulo;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    @Pattern(
            regexp = "PELICULA|SERIE",
            message = "El tipo de contenido debe ser PELICULA o SERIE"
    )
    private String tipoContenido;

    @Size(max = 5000, message = "La descripción no puede superar los 5000 caracteres")
    private String descripcion;

    @Min(value = 1888, message = "El año de estreno no puede ser menor a 1888")
    private Integer anioEstreno;

    private LocalDate fechaEstreno;

    @Min(value = 1, message = "La duración debe ser mayor a 0")
    private Integer duracionMinutos;

    @Size(max = 50, message = "La clasificación de edad no puede superar los 50 caracteres")
    private String clasificacionEdad;

    private String posterUrl;

    @Size(max = 100, message = "El país no puede superar los 100 caracteres")
    private String pais;

    @Size(max = 100, message = "El idioma no puede superar los 100 caracteres")
    private String idioma;

    @PositiveOrZero(message = "El presupuesto no puede ser negativo")
    private BigDecimal presupuesto;

    @Size(max = 50, message = "El proveedor API no puede superar los 50 caracteres")
    private String apiProvider;

    @Size(max = 100, message = "El ID de API no puede superar los 100 caracteres")
    private String apiId;
    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getAnioEstreno() {
        return anioEstreno;
    }

    public void setAnioEstreno(Integer anioEstreno) {
        this.anioEstreno = anioEstreno;
    }

    public LocalDate getFechaEstreno() {
        return fechaEstreno;
    }

    public void setFechaEstreno(LocalDate fechaEstreno) {
        this.fechaEstreno = fechaEstreno;
    }

    public Integer getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Integer duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getClasificacionEdad() {
        return clasificacionEdad;
    }

    public void setClasificacionEdad(String clasificacionEdad) {
        this.clasificacionEdad = clasificacionEdad;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public BigDecimal getPresupuesto() {
        return presupuesto;
    }

    public void setPresupuesto(BigDecimal presupuesto) {
        this.presupuesto = presupuesto;
    }

    public String getApiProvider() {
        return apiProvider;
    }

    public void setApiProvider(String apiProvider) {
        this.apiProvider = apiProvider;
    }

    public String getApiId() {
        return apiId;
    }

    public void setApiId(String apiId) {
        this.apiId = apiId;
    }
}