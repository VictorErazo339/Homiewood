package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Métodos antiguos: se dejan para no romper servicios que aún los usan
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<Usuario> findByUsername(String username);

    // Métodos nuevos: recomendados para username/email sin importar mayúsculas
    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findTop10ByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(
            String nombre,
            String username
    );
}