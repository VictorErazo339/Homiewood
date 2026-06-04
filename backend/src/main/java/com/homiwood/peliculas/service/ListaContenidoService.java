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

import java.util.List;

@Service
public class ListaContenidoService {

    private final ListaContenidoRepository listaContenidoRepository;
    private final ListaRepository listaRepository;
    private final ContenidoRepository contenidoRepository;

    public ListaContenidoService(
            ListaContenidoRepository listaContenidoRepository,
            ListaRepository listaRepository,
            ContenidoRepository contenidoRepository
    ) {
        this.listaContenidoRepository = listaContenidoRepository;
        this.listaRepository = listaRepository;
        this.contenidoRepository = contenidoRepository;
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
            AgregarContenidoListaRequest request
    ) {
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
                    request.getPosicion()
            );
        }

        listaContenidoRepository.deleteByListaIdListaAndContenidoIdContenido(
                idLista,
                request.getIdContenido()
        );

        ListaContenido listaContenido = new ListaContenido();

        listaContenido.setLista(lista);
        listaContenido.setContenido(contenido);
        listaContenido.setPosicion(request.getPosicion());
        listaContenido.setEstado(
                request.getEstado() != null && !request.getEstado().isBlank()
                        ? request.getEstado().toUpperCase()
                        : "POR_VER"
        );
        listaContenido.setNotaUsuario(request.getNotaUsuario());

        return listaContenidoRepository.save(listaContenido);
    }

    @Transactional
    public void eliminarContenidoDeLista(Long idListaContenido) {
        if (idListaContenido == null) {
            throw new BadRequestException("El idListaContenido es obligatorio");
        }

        if (!listaContenidoRepository.existsById(idListaContenido)) {
            throw new NotFoundException("Contenido de lista no encontrado");
        }

        listaContenidoRepository.deleteById(idListaContenido);
    }

    @Transactional
    public void quitarContenidoDeLista(Long idLista, Long idContenido) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (idContenido == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }

        listaContenidoRepository.deleteByListaIdListaAndContenidoIdContenido(
                idLista,
                idContenido
        );
    }

    @Transactional
    public void quitarContenidoPorPosicion(Long idLista, Integer posicion) {
        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (posicion == null) {
            throw new BadRequestException("La posición es obligatoria");
        }

        listaContenidoRepository.deleteByListaIdListaAndPosicion(
                idLista,
                posicion
        );
    }
}