package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.AgregarContenidoListaRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import org.springframework.stereotype.Service;

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
        return listaContenidoRepository.findByListaIdLista(idLista);
    }

    public ListaContenido agregarContenidoALista(Long idLista, AgregarContenidoListaRequest request) {

        if (request.getIdContenido() == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        Contenido contenido = contenidoRepository.findById(request.getIdContenido())
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));

        boolean yaExiste = listaContenidoRepository.existsByListaIdListaAndContenidoIdContenido(
                idLista,
                request.getIdContenido()
        );

        if (yaExiste) {
            throw new DuplicateResourceException("Este contenido ya existe en la lista");
        }

        validarEstado(request.getEstado());

        ListaContenido listaContenido = new ListaContenido();
        listaContenido.setLista(lista);
        listaContenido.setContenido(contenido);
        listaContenido.setPosicion(request.getPosicion());

        if (request.getEstado() == null || request.getEstado().isBlank()) {
            listaContenido.setEstado("POR_VER");
        } else {
            listaContenido.setEstado(request.getEstado().toUpperCase());
        }

        listaContenido.setNotaUsuario(request.getNotaUsuario());

        return listaContenidoRepository.save(listaContenido);
    }

    public void eliminarContenidoDeLista(Long idListaContenido) {

        if (!listaContenidoRepository.existsById(idListaContenido)) {
            throw new NotFoundException("Contenido de lista no encontrado");
        }

        listaContenidoRepository.deleteById(idListaContenido);
    }

    private void validarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return;
        }

        String estadoNormalizado = estado.toUpperCase();

        if (!estadoNormalizado.equals("POR_VER") &&
                !estadoNormalizado.equals("VIENDO") &&
                !estadoNormalizado.equals("VISTO") &&
                !estadoNormalizado.equals("ABANDONADO") &&
                !estadoNormalizado.equals("FAVORITO")) {
            throw new BadRequestException("Estado inválido. Usa POR_VER, VIENDO, VISTO, ABANDONADO o FAVORITO");
        }
    }
}