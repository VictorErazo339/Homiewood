package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.LikeCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
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
}