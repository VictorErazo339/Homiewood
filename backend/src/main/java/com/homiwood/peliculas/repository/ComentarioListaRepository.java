package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ComentarioLista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioListaRepository extends JpaRepository<ComentarioLista, Long> {

    List<ComentarioLista> findByListaIdListaOrderByFechaComentarioDesc(Long idLista);

    List<ComentarioLista> findByUsuarioIdUsuarioOrderByFechaComentarioDesc(Long idUsuario);

    long countByListaIdLista(Long idLista);
}