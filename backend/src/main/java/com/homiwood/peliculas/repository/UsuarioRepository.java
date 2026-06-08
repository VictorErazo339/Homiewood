package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<Usuario> findByUsername(String username);

    List<Usuario> findTop10ByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(
            String nombre,
            String username
    );
}