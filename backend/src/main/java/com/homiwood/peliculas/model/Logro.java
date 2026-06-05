package com.homiwood.peliculas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "logros")
public class Logro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_logro")
    private Long idLogro;

    @Column(name = "codigo", nullable = false, unique = true, length = 80)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "icono", length = 20)
    private String icono;

    @Column(name = "dificultad", nullable = false, length = 20)
    private String dificultad;

    @Column(name = "valor_objetivo", nullable = false)
    private Integer valorObjetivo;

    @Column(name = "oculto", nullable = false)
    private Boolean oculto = false;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "orden")
    private Integer orden = 0;

    public Long getIdLogro() {
        return idLogro;
    }

    public void setIdLogro(Long idLogro) {
        this.idLogro = idLogro;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }

    public Integer getValorObjetivo() {
        return valorObjetivo;
    }

    public void setValorObjetivo(Integer valorObjetivo) {
        this.valorObjetivo = valorObjetivo;
    }

    public Boolean getOculto() {
        return oculto;
    }

    public void setOculto(Boolean oculto) {
        this.oculto = oculto;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }
}