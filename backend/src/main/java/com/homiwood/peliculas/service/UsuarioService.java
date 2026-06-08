package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ActualizarPerfilRequest;
import com.homiwood.peliculas.dto.CrearUsuarioRequest;
import com.homiwood.peliculas.dto.UsuarioSearchResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario crearUsuario(CrearUsuarioRequest request) {

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("El username ya está registrado");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setUsername(request.getUsername().trim());
        usuario.setEmail(request.getEmail().trim());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setIconoPerfil(1);
        usuario.setPerfilPrivado(false);

        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    public List<UsuarioSearchResponse> buscarUsuarios(String query) {

        if (query == null || query.trim().isBlank()) {
            return List.of();
        }

        String texto = query.trim();

        return usuarioRepository
                .findTop10ByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(texto, texto)
                .stream()
                .map(usuario -> new UsuarioSearchResponse(
                        usuario.getIdUsuario(),
                        usuario.getNombre(),
                        usuario.getUsername(),
                        usuario.getDescripcion(),
                        usuario.getIconoPerfil(),
                        usuario.getPerfilPrivado()))
                .toList();
    }

    public Usuario actualizarPerfil(Long id, ActualizarPerfilRequest request) {
        Usuario usuario = buscarPorId(id);

        usuario.setNombre(request.getNombre().trim());

        String descripcion = request.getDescripcion();

        if (descripcion == null || descripcion.trim().isBlank()) {
            usuario.setDescripcion(null);
        } else {
            usuario.setDescripcion(descripcion.trim());
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarIconoPerfil(Long id, Integer iconoPerfil) {
        if (iconoPerfil == null || iconoPerfil < 1 || iconoPerfil > 10) {
            throw new BadRequestException("El icono debe ser un número entre 1 y 10");
        }

        Usuario usuario = buscarPorId(id);
        usuario.setIconoPerfil(iconoPerfil);

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarPrivacidadPerfil(Long id, Boolean perfilPrivado) {
        if (perfilPrivado == null) {
            throw new BadRequestException("Debes indicar si el perfil será privado o público");
        }

        Usuario usuario = buscarPorId(id);
        usuario.setPerfilPrivado(perfilPrivado);

        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {

        if (!usuarioRepository.existsById(id)) {
            throw new NotFoundException("Usuario no encontrado");
        }

        usuarioRepository.deleteById(id);
    }

    public Usuario buscarPorUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new BadRequestException("El username es obligatorio");
        }

        String usernameLimpio = username.trim();

        if (usernameLimpio.startsWith("@")) {
            usernameLimpio = usernameLimpio.substring(1);
        }

        return usuarioRepository.findByUsername(usernameLimpio)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}