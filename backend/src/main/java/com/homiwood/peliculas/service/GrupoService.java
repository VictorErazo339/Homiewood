package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearGrupoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Grupo;
import com.homiwood.peliculas.model.GrupoMiembro;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.GrupoMiembroRepository;
import com.homiwood.peliculas.repository.GrupoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final GrupoMiembroRepository grupoMiembroRepository;
    private final UsuarioRepository usuarioRepository;

    public GrupoService(
            GrupoRepository grupoRepository,
            GrupoMiembroRepository grupoMiembroRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.grupoRepository = grupoRepository;
        this.grupoMiembroRepository = grupoMiembroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Grupo> listarGrupos() {
        return grupoRepository.findAll();
    }

    public Grupo buscarPorId(Long idGrupo) {
        return grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new NotFoundException("Grupo no encontrado"));
    }

    public List<GrupoMiembro> listarGruposDeUsuario(Long idUsuario) {
        return grupoMiembroRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional
    public Grupo crearGrupo(CrearGrupoRequest request) {

        if (request.getIdCreador() == null) {
            throw new BadRequestException("El idCreador es obligatorio");
        }

        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new BadRequestException("El nombre del grupo es obligatorio");
        }

        Usuario creador = usuarioRepository.findById(request.getIdCreador())
                .orElseThrow(() -> new NotFoundException("Usuario creador no encontrado"));

        Grupo grupo = new Grupo();
        grupo.setNombre(request.getNombre().trim());
        grupo.setDescripcion(request.getDescripcion());
        grupo.setCreador(creador);

        Grupo grupoGuardado = grupoRepository.save(grupo);

        GrupoMiembro miembroAdmin = new GrupoMiembro();
        miembroAdmin.setGrupo(grupoGuardado);
        miembroAdmin.setUsuario(creador);
        miembroAdmin.setRol("ADMIN");

        grupoMiembroRepository.save(miembroAdmin);

        return grupoGuardado;
    }

    public void eliminarGrupo(Long idGrupo) {

        if (!grupoRepository.existsById(idGrupo)) {
            throw new NotFoundException("Grupo no encontrado");
        }

        grupoRepository.deleteById(idGrupo);
    }
}