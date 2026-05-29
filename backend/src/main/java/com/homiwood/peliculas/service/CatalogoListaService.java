package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.AgregarContenidoListaRequest;
import com.homiwood.peliculas.dto.GuardarContenidoExternoRequest;
import com.homiwood.peliculas.dto.GuardarYAgregarContenidoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.ListaContenido;
import org.springframework.stereotype.Service;

@Service
public class CatalogoListaService {

    private final CatalogoGuardarService catalogoGuardarService;
    private final ListaContenidoService listaContenidoService;

    public CatalogoListaService(
            CatalogoGuardarService catalogoGuardarService,
            ListaContenidoService listaContenidoService
    ) {
        this.catalogoGuardarService = catalogoGuardarService;
        this.listaContenidoService = listaContenidoService;
    }

    public ListaContenido guardarYAgregarALista(Long idLista, GuardarYAgregarContenidoRequest request) {

        if (idLista == null) {
            throw new BadRequestException("El idLista es obligatorio");
        }

        if (request == null) {
            throw new BadRequestException("Los datos del contenido son obligatorios");
        }

        GuardarContenidoExternoRequest guardarRequest = new GuardarContenidoExternoRequest();

        guardarRequest.setProveedor(request.getProveedor());
        guardarRequest.setApiId(request.getApiId());
        guardarRequest.setTitulo(request.getTitulo());
        guardarRequest.setTipoContenido(request.getTipoContenido());
        guardarRequest.setDescripcion(request.getDescripcion());
        guardarRequest.setFechaEstreno(request.getFechaEstreno());
        guardarRequest.setAnioEstreno(request.getAnioEstreno());
        guardarRequest.setPosterUrl(request.getPosterUrl());
        guardarRequest.setIdiomaOriginal(request.getIdiomaOriginal());
        guardarRequest.setPuntajeExterno(request.getPuntajeExterno());

        Contenido contenidoGuardado = catalogoGuardarService.guardarContenidoExterno(guardarRequest);

        AgregarContenidoListaRequest agregarRequest = new AgregarContenidoListaRequest();

        agregarRequest.setIdContenido(contenidoGuardado.getIdContenido());
        agregarRequest.setPosicion(request.getPosicion());
        agregarRequest.setEstado(request.getEstado());
        agregarRequest.setNotaUsuario(request.getNotaUsuario());

        return listaContenidoService.agregarContenidoALista(idLista, agregarRequest);
    }
}