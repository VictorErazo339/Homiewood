package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ComentarioCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioCalificacionRepository extends JpaRepository<ComentarioCalificacion, Long> {

    List<ComentarioCalificacion> findByCalificacion_IdCalificacionOrderByFechaComentarioAsc(Long idCalificacion);

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 4
    // =========================================================

    long countByUsuario_IdUsuario(Long idUsuario);

    @Query("""
            SELECT COUNT(c)
            FROM ComentarioCalificacion c
            WHERE c.calificacion.usuario.idUsuario = :idUsuario
            AND c.usuario.idUsuario <> :idUsuario
            """)
    long contarComentariosRecibidosPorUsuario(@Param("idUsuario") Long idUsuario);
}