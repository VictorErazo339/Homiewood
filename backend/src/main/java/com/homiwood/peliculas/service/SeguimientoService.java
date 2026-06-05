package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearSeguimientoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Seguimiento;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.SeguimientoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeguimientoService {

    private final SeguimientoRepository seguimientoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogroEvaluacionPublisher logroEvaluacionPublisher;

    public SeguimientoService(
            SeguimientoRepository seguimientoRepository,
            UsuarioRepository usuarioRepository,
            LogroEvaluacionPublisher logroEvaluacionPublisher) {
        this.seguimientoRepository = seguimientoRepository;
        this.usuarioRepository = usuarioRepository;
        this.logroEvaluacionPublisher = logroEvaluacionPublisher;
    }

    public Seguimiento seguirUsuario(Long idSeguido, CrearSeguimientoRequest request) {

        if (request == null) {
            throw new BadRequestException("Los datos del seguimiento son obligatorios");
        }

        if (request.getIdSeguidor() == null) {
            throw new BadRequestException("El idSeguidor es obligatorio");
        }

        if (idSeguido == null) {
            throw new BadRequestException("El idSeguido es obligatorio");
        }

        Long idSeguidor = request.getIdSeguidor();

        if (idSeguidor.equals(idSeguido)) {
            throw new BadRequestException("Un usuario no puede seguirse a sí mismo");
        }

        Usuario seguidor = usuarioRepository.findById(idSeguidor)
                .orElseThrow(() -> new NotFoundException("Usuario seguidor no encontrado"));

        Usuario seguido = usuarioRepository.findById(idSeguido)
                .orElseThrow(() -> new NotFoundException("Usuario seguido no encontrado"));

        boolean yaSigue = seguimientoRepository.existsBySeguidorIdUsuarioAndSeguidoIdUsuario(
                idSeguidor,
                idSeguido);

        if (yaSigue) {
            throw new DuplicateResourceException("Este usuario ya sigue a ese usuario");
        }

        Seguimiento seguimiento = new Seguimiento();
        seguimiento.setSeguidor(seguidor);
        seguimiento.setSeguido(seguido);

        Seguimiento guardado = seguimientoRepository.save(seguimiento);

        logroEvaluacionPublisher.solicitarEvaluacionVarios(
                idSeguidor,
                idSeguido);

        return guardado;
    }

    public List<Seguimiento> listarUsuariosQueSigo(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return seguimientoRepository.findBySeguidorIdUsuario(idUsuario);
    }

    public List<Seguimiento> listarMisSeguidores(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return seguimientoRepository.findBySeguidoIdUsuario(idUsuario);
    }

    public long contarUsuariosQueSigo(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return seguimientoRepository.countBySeguidorIdUsuario(idUsuario);
    }

    public long contarMisSeguidores(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return seguimientoRepository.countBySeguidoIdUsuario(idUsuario);
    }

    public void dejarDeSeguir(Long idSeguidor, Long idSeguido) {

        if (idSeguidor == null) {
            throw new BadRequestException("El idSeguidor es obligatorio");
        }

        if (idSeguido == null) {
            throw new BadRequestException("El idSeguido es obligatorio");
        }

        Seguimiento seguimiento = seguimientoRepository
                .findBySeguidorIdUsuarioAndSeguidoIdUsuario(idSeguidor, idSeguido)
                .orElseThrow(() -> new NotFoundException("Seguimiento no encontrado"));

        seguimientoRepository.delete(seguimiento);
        logroEvaluacionPublisher.solicitarEvaluacionVarios(
                idSeguidor,
                idSeguido);
    }

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 4
    // =========================================================

    public boolean tienePrimerHomie(Long idUsuario) {
        return contarUsuariosQueSigo(idUsuario) >= 1;
    }

    public boolean esSociable(Long idUsuario) {
        return contarUsuariosQueSigo(idUsuario) >= 10;
    }

    public boolean tieneComunidad(Long idUsuario) {
        return contarMisSeguidores(idUsuario) >= 10;
    }

    public boolean esLeyendaHomiewood(Long idUsuario) {
        return contarMisSeguidores(idUsuario) >= 1000;
    }

    public long contarTotalRelacionesSociales(Long idUsuario) {
        return contarUsuariosQueSigo(idUsuario) + contarMisSeguidores(idUsuario);
    }

    private void validarIdUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }
    }
}