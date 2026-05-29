package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ActualizarComentarioListaRequest;
import com.homiwood.peliculas.dto.CrearComentarioListaRequest;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.ComentarioLista;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.ComentarioListaRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComentarioListaService {

    private final ComentarioListaRepository comentarioListaRepository;
    private final ListaRepository listaRepository;
    private final UsuarioRepository usuarioRepository;

    public ComentarioListaService(
            ComentarioListaRepository comentarioListaRepository,
            ListaRepository listaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.comentarioListaRepository = comentarioListaRepository;
        this.listaRepository = listaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ComentarioLista> listarComentariosDeLista(Long idLista) {
        if (!listaRepository.existsById(idLista)) {
            throw new NotFoundException("Lista no encontrada");
        }

        return comentarioListaRepository.findByListaIdListaOrderByFechaComentarioDesc(idLista);
    }

    public List<ComentarioLista> listarComentariosDeUsuario(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new NotFoundException("Usuario no encontrado");
        }

        return comentarioListaRepository.findByUsuarioIdUsuarioOrderByFechaComentarioDesc(idUsuario);
    }

    public long contarComentariosDeLista(Long idLista) {
        if (!listaRepository.existsById(idLista)) {
            throw new NotFoundException("Lista no encontrada");
        }

        return comentarioListaRepository.countByListaIdLista(idLista);
    }

    public ComentarioLista crearComentario(Long idLista, CrearComentarioListaRequest request) {

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        ComentarioLista comentarioLista = new ComentarioLista();
        comentarioLista.setLista(lista);
        comentarioLista.setUsuario(usuario);
        comentarioLista.setComentario(request.getComentario().trim());

        return comentarioListaRepository.save(comentarioLista);
    }

    public ComentarioLista actualizarComentario(
            Long idComentario,
            ActualizarComentarioListaRequest request
    ) {
        ComentarioLista comentarioLista = comentarioListaRepository.findById(idComentario)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado"));

        comentarioLista.setComentario(request.getComentario().trim());

        return comentarioListaRepository.save(comentarioLista);
    }

    public void eliminarComentario(Long idComentario) {
        if (!comentarioListaRepository.existsById(idComentario)) {
            throw new NotFoundException("Comentario no encontrado");
        }

        comentarioListaRepository.deleteById(idComentario);
    }
}