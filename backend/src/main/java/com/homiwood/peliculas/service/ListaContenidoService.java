package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.AgregarContenidoListaRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListaContenidoService {

    private final ListaContenidoRepository listaContenidoRepository;
    private final ListaRepository listaRepository;
    private final ContenidoRepository contenidoRepository;
    private final LogroEvaluacionPublisher logroEvaluacionPublisher;

    public ListaContenidoService(
            ListaContenidoRepository listaContenidoRepository,
            ListaRepository listaRepository,
            ContenidoRepository contenidoRepository,
            LogroEvaluacionPublisher logroEvaluacionPublisher) {
        this.listaContenidoRepository = listaContenidoRepository;
        this.listaRepository = listaRepository;
        this.contenidoRepository = contenidoRepository;
        this.logroEvaluacionPublisher = logroEvaluacionPublisher;
    }

    public List<ListaContenido> listarContenidoDeLista(Long idLista) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        return listaContenidoRepository.findByListaIdLista(idLista);
    }

    @Transactional
    public ListaContenido agregarContenidoALista(
            Long idLista,
            AgregarContenidoListaRequest request) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (request == null) {
            throw new BadRequestException("Los datos del contenido son obligatorios");
        }

        if (request.getIdContenido() == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        Contenido contenido = contenidoRepository.findById(request.getIdContenido())
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));

        if (request.getPosicion() != null) {
            listaContenidoRepository.deleteByListaIdListaAndPosicion(
                    idLista,
                    request.getPosicion());
        }

        listaContenidoRepository.deleteByListaIdListaAndContenidoIdContenido(
                idLista,
                request.getIdContenido());

        ListaContenido listaContenido = new ListaContenido();

        listaContenido.setLista(lista);
        listaContenido.setContenido(contenido);
        listaContenido.setPosicion(request.getPosicion());
        listaContenido.setEstado(
                request.getEstado() != null && !request.getEstado().isBlank()
                        ? request.getEstado().toUpperCase()
                        : "POR_VER");
        listaContenido.setNotaUsuario(request.getNotaUsuario());

        ListaContenido guardado = listaContenidoRepository.save(listaContenido);

        logroEvaluacionPublisher.solicitarEvaluacion(
                lista.getUsuario().getIdUsuario());

        return guardado;
    }

    @Transactional
    public void eliminarContenidoDeLista(Long idListaContenido) {
        if (idListaContenido == null) {
            throw new BadRequestException("El idListaContenido es obligatorio");
        }

        ListaContenido listaContenido = listaContenidoRepository.findById(idListaContenido)
                .orElseThrow(() -> new NotFoundException("Contenido de lista no encontrado"));

        Long idUsuario = listaContenido.getLista().getUsuario().getIdUsuario();

        listaContenidoRepository.delete(listaContenido);

        logroEvaluacionPublisher.solicitarEvaluacion(idUsuario);
    }

    @Transactional
    public void quitarContenidoDeLista(Long idLista, Long idContenido) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (idContenido == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        listaContenidoRepository.deleteByListaIdListaAndContenidoIdContenido(
                idLista,
                idContenido);

        logroEvaluacionPublisher.solicitarEvaluacion(
                lista.getUsuario().getIdUsuario());
    }

    @Transactional
    public void quitarContenidoPorPosicion(Long idLista, Integer posicion) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (posicion == null) {
            throw new BadRequestException("La posición es obligatoria");
        }

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        listaContenidoRepository.deleteByListaIdListaAndPosicion(
                idLista,
                posicion);

        logroEvaluacionPublisher.solicitarEvaluacion(
                lista.getUsuario().getIdUsuario());
    }

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 2
    // =========================================================

    public long contarVistosUsuario(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarPorUsuarioYEstado(idUsuario, "VISTO");
    }

    public long contarPorVerUsuario(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarPorUsuarioYEstado(idUsuario, "POR_VER");
    }

    public long contarTop5Usuario(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarTop5PorUsuario(idUsuario);
    }

    public boolean tieneTop5Completo(Long idUsuario) {
        return contarTop5Usuario(idUsuario) >= 5;
    }

    public long contarVistosHoyUsuario(Long idUsuario) {
        validarIdUsuario(idUsuario);

        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.plusDays(1).atStartOfDay();

        return listaContenidoRepository.contarVistosEnRango(idUsuario, inicio, fin);
    }

    public boolean esMaratonistaHoy(Long idUsuario) {
        return contarVistosHoyUsuario(idUsuario) >= 5;
    }

    public long contarPeliculasVistas(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarVistosPorTipoContenido(idUsuario, "PELICULA");
    }

    public long contarSeriesVistas(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarVistosPorTipoContenido(idUsuario, "SERIE");
    }

    public long contarAnimesVistos(Long idUsuario) {
        validarIdUsuario(idUsuario);
        return listaContenidoRepository.contarVistosPorTipoContenido(idUsuario, "ANIME");
    }

    private void validarIdUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }
    }
}