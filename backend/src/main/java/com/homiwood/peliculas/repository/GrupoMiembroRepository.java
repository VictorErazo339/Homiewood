package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.GrupoMiembro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GrupoMiembroRepository extends JpaRepository<GrupoMiembro, Long> {

    List<GrupoMiembro> findByGrupoIdGrupo(Long idGrupo);

    List<GrupoMiembro> findByUsuarioIdUsuario(Long idUsuario);

    boolean existsByGrupoIdGrupoAndUsuarioIdUsuario(Long idGrupo, Long idUsuario);

    Optional<GrupoMiembro> findByGrupoIdGrupoAndUsuarioIdUsuario(Long idGrupo, Long idUsuario);

    long countByGrupoIdGrupo(Long idGrupo);
}