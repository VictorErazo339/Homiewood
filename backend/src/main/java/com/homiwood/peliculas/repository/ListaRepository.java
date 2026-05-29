package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Lista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListaRepository extends JpaRepository<Lista, Long> {

    List<Lista> findByUsuarioIdUsuario(Long idUsuario);
}