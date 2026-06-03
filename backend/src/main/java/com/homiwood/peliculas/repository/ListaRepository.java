package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Lista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListaRepository extends JpaRepository<Lista, Long> {

    List<Lista> findByUsuarioIdUsuario(Long idUsuario);

    Optional<Lista> findByUsuarioIdUsuarioAndTituloIgnoreCase(Long idUsuario, String titulo);
}