package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.LikeCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface LikeCalificacionRepository extends JpaRepository<LikeCalificacion, Long> {

    Optional<LikeCalificacion> findByCalificacion_IdCalificacionAndUsuario_IdUsuario(
            Long idCalificacion, Long idUsuario
    );

    long countByCalificacion_IdCalificacionAndTipo(
            Long idCalificacion, LikeCalificacion.TipoLike tipo
    );

    List<LikeCalificacion> findByCalificacion_IdCalificacion(Long idCalificacion);

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 4
    // =========================================================

    @Query("""
            SELECT COUNT(l)
            FROM LikeCalificacion l
            WHERE l.calificacion.usuario.idUsuario = :idUsuario
            AND l.usuario.idUsuario <> :idUsuario
            AND l.tipo = :tipo
            """)
    long contarReaccionesRecibidasPorUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("tipo") LikeCalificacion.TipoLike tipo
    );

    @Query("""
            SELECT COUNT(l)
            FROM LikeCalificacion l
            WHERE l.usuario.idUsuario = :idUsuario
            AND l.tipo = :tipo
            """)
    long contarReaccionesHechasPorUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("tipo") LikeCalificacion.TipoLike tipo
    );

    @Query(value = """
            SELECT COALESCE(MAX(t.total_likes), 0)
            FROM (
                SELECT
                    cal.id_calificacion,
                    COUNT(l.id_like) AS total_likes
                FROM calificaciones cal
                LEFT JOIN likes_calificacion l
                    ON l.id_calificacion = cal.id_calificacion
                    AND l.tipo = 'LIKE'
                    AND l.id_usuario <> :idUsuario
                WHERE cal.id_usuario = :idUsuario
                GROUP BY cal.id_calificacion
            ) t
            """, nativeQuery = true)
    long obtenerMaximoLikesEnUnaCalificacion(@Param("idUsuario") Long idUsuario);
}