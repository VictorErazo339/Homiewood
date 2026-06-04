package com.homiwood.peliculas.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class GuardarContenidoExternoRequest {

    @NotBlank(message = "El proveedor es obligatorio")
    private String proveedor;

    @NotBlank(message = "El apiId es obligatorio")
    private String apiId;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    private String tipoContenido;

    private String descripcion;
    private String fechaEstreno;
    private Integer anioEstreno;
    private String posterUrl;
    private String idiomaOriginal;
    private Double puntajeExterno;

    private List<String> generos;

    public String getProveedor() { return proveedor; }
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }

    public String getApiId() { return apiId; }
    public void setApiId(String apiId) { this.apiId = apiId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTipoContenido() { return tipoContenido; }
    public void setTipoContenido(String tipoContenido) { this.tipoContenido = tipoContenido; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getFechaEstreno() { return fechaEstreno; }
    public void setFechaEstreno(String fechaEstreno) { this.fechaEstreno = fechaEstreno; }

    public Integer getAnioEstreno() { return anioEstreno; }
    public void setAnioEstreno(Integer anioEstreno) { this.anioEstreno = anioEstreno; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getIdiomaOriginal() { return idiomaOriginal; }
    public void setIdiomaOriginal(String idiomaOriginal) { this.idiomaOriginal = idiomaOriginal; }

    public Double getPuntajeExterno() { return puntajeExterno; }
    public void setPuntajeExterno(Double puntajeExterno) { this.puntajeExterno = puntajeExterno; }

    public List<String> getGeneros() { return generos; }
    public void setGeneros(List<String> generos) { this.generos = generos; }
}