package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.AgregarGeneroContenidoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.ContenidoGenero;
import com.homiwood.peliculas.model.Genero;
import com.homiwood.peliculas.repository.ContenidoGeneroRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.GeneroLogroProjection;
import com.homiwood.peliculas.repository.GeneroRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContenidoGeneroService {

    private final ContenidoGeneroRepository contenidoGeneroRepository;
    private final ContenidoRepository contenidoRepository;
    private final GeneroRepository generoRepository;

    public ContenidoGeneroService(
            ContenidoGeneroRepository contenidoGeneroRepository,
            ContenidoRepository contenidoRepository,
            GeneroRepository generoRepository
    ) {
        this.contenidoGeneroRepository = contenidoGeneroRepository;
        this.contenidoRepository = contenidoRepository;
        this.generoRepository = generoRepository;
    }

    public List<ContenidoGenero> listarGenerosDeContenido(Long idContenido) {
        return contenidoGeneroRepository.findByContenidoIdContenido(idContenido);
    }

    public List<ContenidoGenero> listarContenidosPorGenero(Long idGenero) {
        return contenidoGeneroRepository.findByGeneroIdGenero(idGenero);
    }

    public ContenidoGenero agregarGeneroAContenido(
            Long idContenido,
            AgregarGeneroContenidoRequest request
    ) {
        if (idContenido == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }

        if (request == null) {
            throw new BadRequestException("Los datos del género son obligatorios");
        }

        if (request.getIdGenero() == null) {
            throw new BadRequestException("El idGenero es obligatorio");
        }

        Contenido contenido = contenidoRepository.findById(idContenido)
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));

        Genero genero = generoRepository.findById(request.getIdGenero())
                .orElseThrow(() -> new NotFoundException("Género no encontrado"));

        boolean yaExiste = contenidoGeneroRepository.existsByContenidoIdContenidoAndGeneroIdGenero(
                idContenido,
                request.getIdGenero()
        );

        if (yaExiste) {
            throw new DuplicateResourceException("Este género ya está asignado a este contenido");
        }

        ContenidoGenero contenidoGenero = new ContenidoGenero();
        contenidoGenero.setContenido(contenido);
        contenidoGenero.setGenero(genero);

        return contenidoGeneroRepository.save(contenidoGenero);
    }

    public void eliminarRelacion(Long idContenidoGenero) {
        if (idContenidoGenero == null) {
            throw new BadRequestException("El idContenidoGenero es obligatorio");
        }

        if (!contenidoGeneroRepository.existsById(idContenidoGenero)) {
            throw new NotFoundException("Relación contenido-género no encontrada");
        }

        contenidoGeneroRepository.deleteById(idContenidoGenero);
    }

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 3
    // =========================================================

    public long contarGenerosDistintosVistosUsuario(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return contenidoGeneroRepository.contarGenerosDistintosVistosUsuario(idUsuario);
    }

    public long contarVistosPorGeneroExacto(Long idUsuario, String nombreGenero) {
        validarIdUsuario(idUsuario);
        validarTextoGenero(nombreGenero);
        return contenidoGeneroRepository.contarVistosPorGeneroExacto(idUsuario, nombreGenero.trim());
    }

    public long contarVistosPorGeneroSimilar(Long idUsuario, String textoGenero) {
        validarIdUsuario(idUsuario);
        validarTextoGenero(textoGenero);
        return contenidoGeneroRepository.contarVistosPorGeneroSimilar(idUsuario, textoGenero.trim());
    }

    public List<GeneroLogroProjection> obtenerResumenGenerosUsuario(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return contenidoGeneroRepository.obtenerResumenGenerosUsuario(idUsuario);
    }

    public boolean esExploradorGeneros(Long idUsuario) {
        return contarGenerosDistintosVistosUsuario(idUsuario) >= 10;
    }

    public boolean esFanRomance(Long idUsuario) {
        return contarVistosPorGeneroSimilar(idUsuario, "romance") >= 5;
    }

    public boolean esFanDrama(Long idUsuario) {
        return contarVistosPorGeneroSimilar(idUsuario, "drama") >= 5;
    }

    public boolean esFanAccion(Long idUsuario) {
        long accionEspanol = contarVistosPorGeneroSimilar(idUsuario, "acción");
        long accionSinAcento = contarVistosPorGeneroSimilar(idUsuario, "accion");
        long actionIngles = contarVistosPorGeneroSimilar(idUsuario, "action");

        return (accionEspanol + accionSinAcento + actionIngles) >= 5;
    }

    public boolean esFanComedia(Long idUsuario) {
        long comedia = contarVistosPorGeneroSimilar(idUsuario, "comedia");
        long comedy = contarVistosPorGeneroSimilar(idUsuario, "comedy");

        return (comedia + comedy) >= 5;
    }

    private void validarIdUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }
    }

    private void validarTextoGenero(String textoGenero) {
        if (textoGenero == null || textoGenero.isBlank()) {
            throw new BadRequestException("El género es obligatorio");
        }
    }
}