package com.homiwood.peliculas.dto;

public class CatalogoExternoResponse {

    private String proveedor;
    private String apiId;
    private String titulo;
    private String tipoContenido;
    private String descripcion;
    private String fechaEstreno;
    private Integer anioEstreno;
    private String posterUrl;
    private String idiomaOriginal;
    private Double puntajeExterno;

    public CatalogoExternoResponse() {
    }

    public CatalogoExternoResponse(
            String proveedor,
            String apiId,
            String titulo,
            String tipoContenido,
            String descripcion,
            String fechaEstreno,
            Integer anioEstreno,
            String posterUrl,
            String idiomaOriginal,
            Double puntajeExterno
    ) {
        this.proveedor = proveedor;
        this.apiId = apiId;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.descripcion = descripcion;
        this.fechaEstreno = fechaEstreno;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.idiomaOriginal = idiomaOriginal;
        this.puntajeExterno = puntajeExterno;
    }

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
}