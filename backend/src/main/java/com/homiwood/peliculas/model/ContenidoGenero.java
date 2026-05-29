package com.homiwood.peliculas.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "contenido_generos",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_contenido", "id_genero"})
        }
)
public class ContenidoGenero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contenido_genero")
    private Long idContenidoGenero;

    @ManyToOne
    @JoinColumn(name = "id_contenido", nullable = false)
    private Contenido contenido;

    @ManyToOne
    @JoinColumn(name = "id_genero", nullable = false)
    private Genero genero;

    public Long getIdContenidoGenero() {
        return idContenidoGenero;
    }

    public void setIdContenidoGenero(Long idContenidoGenero) {
        this.idContenidoGenero = idContenidoGenero;
    }

    public Contenido getContenido() {
        return contenido;
    }

    public void setContenido(Contenido contenido) {
        this.contenido = contenido;
    }

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
    }
}