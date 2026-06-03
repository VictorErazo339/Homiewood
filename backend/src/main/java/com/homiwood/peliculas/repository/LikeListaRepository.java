package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.LikeLista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LikeListaRepository extends JpaRepository<LikeLista, Long> {

    List<LikeLista> findByListaIdLista(Long idLista);

    List<LikeLista> findByUsuarioIdUsuario(Long idUsuario);

    boolean existsByUsuarioIdUsuarioAndListaIdLista(Long idUsuario, Long idLista);

    Optional<LikeLista> findByUsuarioIdUsuarioAndListaIdLista(Long idUsuario, Long idLista);

    long countByListaIdLista(Long idLista);
}