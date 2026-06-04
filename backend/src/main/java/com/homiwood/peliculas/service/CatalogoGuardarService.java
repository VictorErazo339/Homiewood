package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.GuardarContenidoExternoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.ContenidoGenero;
import com.homiwood.peliculas.model.Genero;
import com.homiwood.peliculas.repository.ContenidoGeneroRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.GeneroRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CatalogoGuardarService {

    private final ContenidoRepository contenidoRepository;
    private final GeneroRepository generoRepository;
    private final ContenidoGeneroRepository contenidoGeneroRepository;

    public CatalogoGuardarService(
            ContenidoRepository contenidoRepository,
            GeneroRepository generoRepository,
            ContenidoGeneroRepository contenidoGeneroRepository
    ) {
        this.contenidoRepository = contenidoRepository;
        this.generoRepository = generoRepository;
        this.contenidoGeneroRepository = contenidoGeneroRepository;
    }

    public Contenido guardarContenidoExterno(GuardarContenidoExternoRequest request) {

        validarRequest(request);

        Optional<Contenido> contenidoExistente =
                contenidoRepository.findByApiProviderAndApiId(
                        request.getProveedor(),
                        request.getApiId()
                );

        if (contenidoExistente.isPresent()) {
            Contenido contenido = contenidoExistente.get();

            guardarGeneros(
                    contenido,
                    request.getGeneros()
            );

            return contenido;
        }

        Contenido contenido = new Contenido();

        contenido.setTitulo(request.getTitulo());
        contenido.setTipoContenido(request.getTipoContenido().toUpperCase());
        contenido.setDescripcion(request.getDescripcion());
        contenido.setAnioEstreno(request.getAnioEstreno());
        contenido.setFechaEstreno(convertirFecha(request.getFechaEstreno()));
        contenido.setPosterUrl(request.getPosterUrl());
        contenido.setIdioma(request.getIdiomaOriginal());
        contenido.setApiProvider(request.getProveedor());
        contenido.setApiId(request.getApiId());

        Contenido contenidoGuardado =
                contenidoRepository.save(contenido);

        guardarGeneros(
                contenidoGuardado,
                request.getGeneros()
        );

        return contenidoGuardado;
    }

    private void guardarGeneros(
            Contenido contenido,
            List<String> generos
    ) {

        if (contenido == null || generos == null || generos.isEmpty()) {
            return;
        }

        for (String nombreGenero : generos) {

            if (nombreGenero == null || nombreGenero.isBlank()) {
                continue;
            }

            String nombreNormalizado =
                    nombreGenero.trim();

            Genero genero =
                    generoRepository
                            .findByNombreIgnoreCase(nombreNormalizado)
                            .orElseGet(() -> {

                                Genero nuevoGenero =
                                        new Genero();

                                nuevoGenero.setNombre(nombreNormalizado);

                                return generoRepository.save(nuevoGenero);
                            });

            boolean relacionExiste =
                    contenidoGeneroRepository
                            .existsByContenidoIdContenidoAndGeneroIdGenero(
                                    contenido.getIdContenido(),
                                    genero.getIdGenero()
                            );

            if (!relacionExiste) {

                ContenidoGenero relacion =
                        new ContenidoGenero();

                relacion.setContenido(contenido);
                relacion.setGenero(genero);

                contenidoGeneroRepository.save(relacion);
            }
        }
    }

    private void validarRequest(GuardarContenidoExternoRequest request) {

        if (request.getProveedor() == null || request.getProveedor().isBlank()) {
            throw new BadRequestException("El proveedor es obligatorio");
        }

        if (request.getApiId() == null || request.getApiId().isBlank()) {
            throw new BadRequestException("El apiId es obligatorio");
        }

        if (request.getTitulo() == null || request.getTitulo().isBlank()) {
            throw new BadRequestException("El título es obligatorio");
        }

        if (request.getTipoContenido() == null || request.getTipoContenido().isBlank()) {
            throw new BadRequestException("El tipo de contenido es obligatorio");
        }

        String tipo =
                request.getTipoContenido().toUpperCase();

        if (!tipo.equals("PELICULA") && !tipo.equals("SERIE")) {
            throw new BadRequestException("El tipo de contenido debe ser PELICULA o SERIE");
        }
    }

    private LocalDate convertirFecha(String fecha) {

        if (fecha == null || fecha.isBlank()) {
            return null;
        }

        try {
            String soloFecha =
                    fecha.length() >= 10
                            ? fecha.substring(0, 10)
                            : fecha;

            return LocalDate.parse(soloFecha);

        } catch (Exception e) {
            return null;
        }
    }
}