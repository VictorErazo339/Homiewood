package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {

    List<Calificacion> findByUsuarioIdUsuario(Long idUsuario);

    List<Calificacion> findByContenidoIdContenido(Long idContenido);

    boolean existsByUsuarioIdUsuarioAndContenidoIdContenido(Long idUsuario, Long idContenido);

    @Query("SELECT AVG(c.puntaje) FROM Calificacion c WHERE c.contenido.idContenido = :idContenido")
    Double calcularPromedioPorContenido(@Param("idContenido") Long idContenido);
}