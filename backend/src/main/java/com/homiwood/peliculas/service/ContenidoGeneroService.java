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

    public ContenidoGenero agregarGeneroAContenido(Long idContenido, AgregarGeneroContenidoRequest request) {

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

        if (!contenidoGeneroRepository.existsById(idContenidoGenero)) {
            throw new NotFoundException("Relación contenido-género no encontrada");
        }

        contenidoGeneroRepository.deleteById(idContenidoGenero);
    }
}