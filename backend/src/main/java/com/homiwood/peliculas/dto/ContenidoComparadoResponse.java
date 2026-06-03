package com.homiwood.peliculas.dto;

public class ContenidoComparadoResponse {

    private Long idContenido;
    private String titulo;
    private String tipoContenido;
    private Integer anioEstreno;
    private String posterUrl;

    private String estadoUsuario1;
    private String estadoUsuario2;

    private String notaUsuario1;
    private String notaUsuario2;

    private String motivo;

    public ContenidoComparadoResponse() {
    }

    public ContenidoComparadoResponse(
            Long idContenido,
            String titulo,
            String tipoContenido,
            Integer anioEstreno,
            String posterUrl,
            String estadoUsuario1,
            String estadoUsuario2,
            String notaUsuario1,
            String notaUsuario2,
            String motivo
    ) {
        this.idContenido = idContenido;
        this.titulo = titulo;
        this.tipoContenido = tipoContenido;
        this.anioEstreno = anioEstreno;
        this.posterUrl = posterUrl;
        this.estadoUsuario1 = estadoUsuario1;
        this.estadoUsuario2 = estadoUsuario2;
        this.notaUsuario1 = notaUsuario1;
        this.notaUsuario2 = notaUsuario2;
        this.motivo = motivo;
    }

    public Long getIdContenido() {
        return idContenido;
    }

    public void setIdContenido(Long idContenido) {
        this.idContenido = idContenido;
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

    public String getEstadoUsuario1() {
        return estadoUsuario1;
    }

    public void setEstadoUsuario1(String estadoUsuario1) {
        this.estadoUsuario1 = estadoUsuario1;
    }

    public String getEstadoUsuario2() {
        return estadoUsuario2;
    }

    public void setEstadoUsuario2(String estadoUsuario2) {
        this.estadoUsuario2 = estadoUsuario2;
    }

    public String getNotaUsuario1() {
        return notaUsuario1;
    }

    public void setNotaUsuario1(String notaUsuario1) {
        this.notaUsuario1 = notaUsuario1;
    }

    public String getNotaUsuario2() {
        return notaUsuario2;
    }

    public void setNotaUsuario2(String notaUsuario2) {
        this.notaUsuario2 = notaUsuario2;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}