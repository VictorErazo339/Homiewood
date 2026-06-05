package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.UsuarioLogro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioLogroRepository extends JpaRepository<UsuarioLogro, Long> {

    Optional<UsuarioLogro> findByUsuarioIdUsuarioAndLogroIdLogro(
            Long idUsuario,
            Long idLogro
    );

    Optional<UsuarioLogro> findByUsuarioIdUsuarioAndLogroCodigo(
            Long idUsuario,
            String codigo
    );

    @Query("""
            SELECT ul
            FROM UsuarioLogro ul
            JOIN FETCH ul.logro l
            WHERE ul.usuario.idUsuario = :idUsuario
            ORDER BY l.orden ASC, l.nombre ASC
            """)
    List<UsuarioLogro> listarPorUsuarioOrdenado(@Param("idUsuario") Long idUsuario);

    @Query("""
            SELECT ul
            FROM UsuarioLogro ul
            JOIN FETCH ul.logro l
            WHERE ul.usuario.idUsuario = :idUsuario
            AND ul.destacado = true
            AND ul.desbloqueado = true
            ORDER BY l.orden ASC, l.nombre ASC
            """)
    List<UsuarioLogro> listarDestacadosPorUsuario(@Param("idUsuario") Long idUsuario);
}