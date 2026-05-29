package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.*;

public class GuardarYAgregarContenidoRequest {

    @NotBlank(message = "El proveedor es obligatorio")
    @Pattern(
            regexp = "TMDB|JIKAN",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "El proveedor debe ser TMDB o JIKAN"
    )
    private String proveedor;

    @NotBlank(message = "El apiId es obligatorio")
    @Size(max = 100, message = "El apiId no puede superar los 100 caracteres")
    private String apiId;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar los 200 caracteres")
    private String titulo;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    @Pattern(
            regexp = "PELICULA|SERIE",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "El tipo de contenido debe ser PELICULA o SERIE"
    )
    private String tipoContenido;

    @Size(max = 5000, message = "La descripción no puede superar los 5000 caracteres")
    private String descripcion;

    private String fechaEstreno;

    @Min(value = 1888, message = "El año de estreno no puede ser menor a 1888")
    private Integer anioEstreno;

    private String posterUrl;

    @Size(max = 20, message = "El idioma original no puede superar los 20 caracteres")
    private String idiomaOriginal;

    @PositiveOrZero(message = "El puntaje externo no puede ser negativo")
    private Double puntajeExterno;

    @Positive(message = "La posición debe ser mayor a 0")
    private Integer posicion;

    @Pattern(
            regexp = "POR_VER|VIENDO|VISTO|ABANDONADO|FAVORITO",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "El estado debe ser POR_VER, VIENDO, VISTO, ABANDONADO o FAVORITO"
    )
    private String estado;

    @Size(max = 1000, message = "La nota no puede superar los 1000 caracteres")
    private String notaUsuario;

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    public String getApiId() {
        return apiId;
    }

    public void setApiId(String apiId) {
        this.apiId = apiId;
    }

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

    public String getFechaEstreno() {
        return fechaEstreno;
    }

    public void setFechaEstreno(String fechaEstreno) {
        this.fechaEstreno = fechaEstreno;
    }

    public Integer getAnioEstreno() {
        return anioEstreno;
    }

    public void setAnioEstreno(Integer anioEstreno) {
        this.anioEstreno = anioEstreno;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getIdiomaOriginal() {
        return idiomaOriginal;
    }

    public void setIdiomaOriginal(String idiomaOriginal) {
        this.idiomaOriginal = idiomaOriginal;
    }

    public Double getPuntajeExterno() {
        return puntajeExterno;
    }

    public void setPuntajeExterno(Double puntajeExterno) {
        this.puntajeExterno = puntajeExterno;
    }

    public Integer getPosicion() {
        return posicion;
    }

    public void setPosicion(Integer posicion) {
        this.posicion = posicion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotaUsuario() {
        return notaUsuario;
    }

    public void setNotaUsuario(String notaUsuario) {
        this.notaUsuario = notaUsuario;
    }
}