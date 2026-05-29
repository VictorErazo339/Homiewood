package com.homiwood.peliculas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(
        name = "likes_calificacion",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_calificacion", "id_usuario"})
        }
)
public class LikeCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_like")
    private Long idLike;

    @ManyToOne
    @JoinColumn(name = "id_calificacion", nullable = false)
    private Calificacion calificacion;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoLike tipo;

    @Column(name = "fecha_like")
    private LocalDateTime fechaLike = LocalDateTime.now();

    public enum TipoLike {
        LIKE, DISLIKE
    }
}