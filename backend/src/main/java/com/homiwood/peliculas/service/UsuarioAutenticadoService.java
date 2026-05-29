package com.homiwood.peliculas.service;

import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioAutenticadoService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAutenticadoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obtenerUsuarioAutenticado() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No hay usuario autenticado");
        }

        String username = authentication.getName();

        if (username == null || username.isBlank()) {
            throw new BadRequestException("No se pudo obtener el username del token");
        }

        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado"));
    }

    public Long obtenerIdUsuarioAutenticado() {
        return obtenerUsuarioAutenticado().getIdUsuario();
    }
}