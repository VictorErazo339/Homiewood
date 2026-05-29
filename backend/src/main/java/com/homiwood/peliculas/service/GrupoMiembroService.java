package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.AgregarMiembroGrupoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Grupo;
import com.homiwood.peliculas.model.GrupoMiembro;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.GrupoMiembroRepository;
import com.homiwood.peliculas.repository.GrupoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GrupoMiembroService {

    private final GrupoMiembroRepository grupoMiembroRepository;
    private final GrupoRepository grupoRepository;
    private final UsuarioRepository usuarioRepository;

    public GrupoMiembroService(
            GrupoMiembroRepository grupoMiembroRepository,
            GrupoRepository grupoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.grupoMiembroRepository = grupoMiembroRepository;
        this.grupoRepository = grupoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<GrupoMiembro> listarMiembros(Long idGrupo) {
        return grupoMiembroRepository.findByGrupoIdGrupo(idGrupo);
    }

    public long contarMiembros(Long idGrupo) {
        return grupoMiembroRepository.countByGrupoIdGrupo(idGrupo);
    }

    public GrupoMiembro agregarMiembro(Long idGrupo, AgregarMiembroGrupoRequest request) {

        if (request.getIdUsuario() == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        Grupo grupo = grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new NotFoundException("Grupo no encontrado"));

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        boolean yaExiste = grupoMiembroRepository.existsByGrupoIdGrupoAndUsuarioIdUsuario(
                idGrupo,
                request.getIdUsuario()
        );

        if (yaExiste) {
            throw new DuplicateResourceException("El usuario ya pertenece a este grupo");
        }

        GrupoMiembro miembro = new GrupoMiembro();
        miembro.setGrupo(grupo);
        miembro.setUsuario(usuario);
        miembro.setRol(normalizarRol(request.getRol()));

        return grupoMiembroRepository.save(miembro);
    }

    public void eliminarMiembro(Long idGrupo, Long idUsuario) {

        GrupoMiembro miembro = grupoMiembroRepository
                .findByGrupoIdGrupoAndUsuarioIdUsuario(idGrupo, idUsuario)
                .orElseThrow(() -> new NotFoundException("Miembro no encontrado en el grupo"));

        grupoMiembroRepository.delete(miembro);
    }

    private String normalizarRol(String rol) {
        if (rol == null || rol.isBlank()) {
            return "MIEMBRO";
        }

        String rolNormalizado = rol.toUpperCase();

        if (!rolNormalizado.equals("ADMIN") && !rolNormalizado.equals("MIEMBRO")) {
            throw new BadRequestException("Rol inválido. Usa ADMIN o MIEMBRO");
        }

        return rolNormalizado;
    }
}