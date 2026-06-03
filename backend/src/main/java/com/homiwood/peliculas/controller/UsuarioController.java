package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.CrearUsuarioRequest;
import com.homiwood.peliculas.dto.UsuarioResponse;
import com.homiwood.peliculas.mapper.ResponseMapper;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<UsuarioResponse> crearUsuario(@Valid @RequestBody CrearUsuarioRequest request) {
        Usuario usuarioCreado = usuarioService.crearUsuario(request);
        return ResponseEntity.ok(responseMapper.toUsuarioResponse(usuarioCreado));
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscarUsuario(@PathVariable Long id) {
        return responseMapper.toUsuarioResponse(usuarioService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    }
} 