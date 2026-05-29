package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ComentarioCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioCalificacionRepository extends JpaRepository<ComentarioCalificacion, Long> {

    List<ComentarioCalificacion> findByCalificacion_IdCalificacionOrderByFechaComentarioAsc(Long idCalificacion);
}