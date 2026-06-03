package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Seguimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {

    List<Seguimiento> findBySeguidorIdUsuario(Long idSeguidor);

    List<Seguimiento> findBySeguidoIdUsuario(Long idSeguido);

    boolean existsBySeguidorIdUsuarioAndSeguidoIdUsuario(Long idSeguidor, Long idSeguido);

    Optional<Seguimiento> findBySeguidorIdUsuarioAndSeguidoIdUsuario(Long idSeguidor, Long idSeguido);

    long countBySeguidorIdUsuario(Long idSeguidor);

    long countBySeguidoIdUsuario(Long idSeguido);
}