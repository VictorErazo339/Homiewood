package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Calificacion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {

    List<Calificacion> findByUsuarioIdUsuario(Long idUsuario);

    List<Calificacion> findByContenidoIdContenido(Long idContenido);

    boolean existsByUsuarioIdUsuarioAndContenidoIdContenido(Long idUsuario, Long idContenido);

    Optional<Calificacion> findByUsuarioIdUsuarioAndContenidoIdContenido(
            Long idUsuario,
            Long idContenido
    );

    @Query("""
            SELECT c
            FROM Calificacion c
            JOIN FETCH c.usuario u
            JOIN FETCH c.contenido con
            WHERE c.comentario IS NOT NULL
            AND TRIM(c.comentario) <> ''
            AND (
                u.idUsuario = :idUsuario
                OR u.idUsuario IN (
                    SELECT s.seguido.idUsuario
                    FROM Seguimiento s
                    WHERE s.seguidor.idUsuario = :idUsuario
                )
            )
            ORDER BY c.fechaCalificacion DESC
            """)
    List<Calificacion> listarFeedHomies(
            @Param("idUsuario") Long idUsuario,
            Pageable pageable
    );

    @Query("""
        SELECT c
        FROM Calificacion c
        JOIN FETCH c.usuario u
        JOIN FETCH c.contenido con
        WHERE c.comentario IS NOT NULL
        AND TRIM(c.comentario) <> ''
        ORDER BY c.fechaCalificacion DESC
        """)
    List<Calificacion> findAllByOrderByFechaCalificacionDesc(Pageable pageable);

    @Query("SELECT AVG(c.puntaje) FROM Calificacion c WHERE c.contenido.idContenido = :idContenido")
    Double calcularPromedioPorContenido(@Param("idContenido") Long idContenido);

    long countByUsuarioIdUsuario(Long idUsuario);

    @Query("""
            SELECT COUNT(c)
            FROM Calificacion c
            WHERE c.usuario.idUsuario = :idUsuario
            AND c.comentario IS NOT NULL
            AND TRIM(c.comentario) <> ''
            """)
    long contarResenasConComentario(@Param("idUsuario") Long idUsuario);

    @Query("""
            SELECT c.fechaCalificacion
            FROM Calificacion c
            WHERE c.usuario.idUsuario = :idUsuario
            AND c.fechaCalificacion IS NOT NULL
            ORDER BY c.fechaCalificacion DESC
            """)
    List<LocalDateTime> listarFechasActividadPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query(value = """
            SELECT COUNT(*)
            FROM calificaciones c
            WHERE c.id_usuario = :idUsuario
            AND c.fecha_calificacion IS NOT NULL
            AND EXTRACT(HOUR FROM c.fecha_calificacion) BETWEEN 0 AND 3
            """, nativeQuery = true)
    long contarCalificacionesMadrugada(@Param("idUsuario") Long idUsuario);



}