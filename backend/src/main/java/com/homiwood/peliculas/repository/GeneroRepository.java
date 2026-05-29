package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Genero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneroRepository extends JpaRepository<Genero, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    Optional<Genero> findByNombreIgnoreCase(String nombre);
}