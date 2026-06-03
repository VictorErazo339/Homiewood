package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearListaAutenticadaRequest;
import com.homiwood.peliculas.dto.CrearListaRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListaService {

    private final ListaRepository listaRepository;
    private final UsuarioRepository usuarioRepository;

    public ListaService(ListaRepository listaRepository, UsuarioRepository usuarioRepository) {
        this.listaRepository = listaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Lista> listarListas() {
        return listaRepository.findAll();
    }

    public List<Lista> listarPorUsuario(Long idUsuario) {
        return listaRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public Lista buscarPorId(Long id) {
        return listaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));
    }

    public Lista crearLista(CrearListaRequest request) {

        if (request.getIdUsuario() == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        if (request.getTitulo() == null || request.getTitulo().isBlank()) {
            throw new BadRequestException("El título de la lista es obligatorio");
        }

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Lista lista = new Lista();
        lista.setUsuario(usuario);
        lista.setTitulo(request.getTitulo());
        lista.setDescripcion(request.getDescripcion());

        if (request.getVisibilidad() == null || request.getVisibilidad().isBlank()) {
            lista.setVisibilidad("PUBLICA");
        } else {
            String visibilidad = request.getVisibilidad().toUpperCase();

            if (!visibilidad.equals("PUBLICA") &&
                    !visibilidad.equals("PRIVADA") &&
                    !visibilidad.equals("SOLO_AMIGOS")) {
                throw new BadRequestException("Visibilidad inválida. Usa PUBLICA, PRIVADA o SOLO_AMIGOS");
            }

            lista.setVisibilidad(visibilidad);
        }

        return listaRepository.save(lista);
    }
    public Lista crearListaParaUsuario(Usuario usuario, CrearListaAutenticadaRequest request) {

        Lista lista = new Lista();
        lista.setUsuario(usuario);
        lista.setTitulo(request.getTitulo().trim());
        lista.setDescripcion(request.getDescripcion());

        if (request.getVisibilidad() == null || request.getVisibilidad().isBlank()) {
            lista.setVisibilidad("PUBLICA");
        } else {
            String visibilidad = request.getVisibilidad().toUpperCase();

            if (!visibilidad.equals("PUBLICA") &&
                    !visibilidad.equals("PRIVADA") &&
                    !visibilidad.equals("SOLO_AMIGOS")) {
                throw new BadRequestException("Visibilidad inválida. Usa PUBLICA, PRIVADA o SOLO_AMIGOS");
            }

            lista.setVisibilidad(visibilidad);
        }

        return listaRepository.save(lista);
    }
    public void eliminarLista(Long id) {

        if (!listaRepository.existsById(id)) {
            throw new NotFoundException("Lista no encontrada");
        }

        listaRepository.deleteById(id);
    }
}