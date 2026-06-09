package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.ActualizarPerfilRequest;
import com.homiwood.peliculas.dto.CrearUsuarioRequest;
import com.homiwood.peliculas.dto.UsuarioResponse;
import com.homiwood.peliculas.dto.UsuarioSearchResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.homiwood.peliculas.dto.PerfilResumenResponse;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ResponseMapper responseMapper;

    public UsuarioController(UsuarioService usuarioService, ResponseMapper responseMapper) {
        this.usuarioService = usuarioService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios()
                .stream()
                .map(responseMapper::toUsuarioResponse)
                .toList();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<UsuarioSearchResponse>> buscarUsuarios(
            @RequestParam String query) {
        return ResponseEntity.ok(usuarioService.buscarUsuarios(query));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody CrearUsuarioRequest request) {
        Usuario usuarioCreado = usuarioService.crearUsuario(request);
        return ResponseEntity.ok(responseMapper.toUsuarioResponse(usuarioCreado));
    }

    @GetMapping("/username/{username}")
    public UsuarioResponse buscarUsuarioPorUsername(@PathVariable String username) {
        return responseMapper.toUsuarioResponse(
                usuarioService.buscarPorUsername(username));
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscarUsuario(@PathVariable Long id) {
        return responseMapper.toUsuarioResponse(usuarioService.buscarPorId(id));
    }

    @GetMapping("/{id}/perfil-resumen")
    public ResponseEntity<PerfilResumenResponse> obtenerPerfilResumen(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPerfilResumen(id));
    }

    @PutMapping("/{id}/perfil")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        Usuario usuarioActualizado = usuarioService.actualizarPerfil(id, request);
        return ResponseEntity.ok(responseMapper.toUsuarioResponse(usuarioActualizado));
    }

    @PatchMapping("/{id}/icono")
    public ResponseEntity<UsuarioResponse> actualizarIcono(
            @PathVariable Long id,
            @RequestParam Integer iconoPerfil) {
        Usuario usuarioActualizado = usuarioService.actualizarIconoPerfil(id, iconoPerfil);
        return ResponseEntity.ok(responseMapper.toUsuarioResponse(usuarioActualizado));
    }

    @PatchMapping("/{id}/privacidad")
    public ResponseEntity<UsuarioResponse> actualizarPrivacidad(
            @PathVariable Long id,
            @RequestParam Boolean perfilPrivado) {
        Usuario usuarioActualizado = usuarioService.actualizarPrivacidadPerfil(id, perfilPrivado);
        return ResponseEntity.ok(responseMapper.toUsuarioResponse(usuarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    }
}