package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    List<Grupo> findByCreadorIdUsuario(Long idCreador);
}