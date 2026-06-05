package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Logro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LogroRepository extends JpaRepository<Logro, Long> {

    Optional<Logro> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Logro> findByActivoTrueOrderByOrdenAscNombreAsc();
}