package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ContenidoGenero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContenidoGeneroRepository extends JpaRepository<ContenidoGenero, Long> {

    List<ContenidoGenero> findByContenidoIdContenido(Long idContenido);

    List<ContenidoGenero> findByGeneroIdGenero(Long idGenero);

    boolean existsByContenidoIdContenidoAndGeneroIdGenero(Long idContenido, Long idGenero);
}