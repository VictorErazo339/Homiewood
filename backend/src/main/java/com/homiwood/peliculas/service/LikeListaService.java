package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearLikeListaRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.LikeLista;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.LikeListaRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeListaService {

    private final LikeListaRepository likeListaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ListaRepository listaRepository;

    public LikeListaService(
            LikeListaRepository likeListaRepository,
            UsuarioRepository usuarioRepository,
            ListaRepository listaRepository
    ) {
        this.likeListaRepository = likeListaRepository;
        this.usuarioRepository = usuarioRepository;
        this.listaRepository = listaRepository;
    }

    public List<LikeLista> listarLikesDeLista(Long idLista) {
        return likeListaRepository.findByListaIdLista(idLista);
    }

    public List<LikeLista> listarLikesDeUsuario(Long idUsuario) {
        return likeListaRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public long contarLikesDeLista(Long idLista) {
        return likeListaRepository.countByListaIdLista(idLista);
    }

    public LikeLista darLike(Long idLista, CrearLikeListaRequest request) {

        if (request.getIdUsuario() == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Lista lista = listaRepository.findById(idLista)
                .orElseThrow(() -> new NotFoundException("Lista no encontrada"));

        boolean yaTieneLike = likeListaRepository.existsByUsuarioIdUsuarioAndListaIdLista(
                request.getIdUsuario(),
                idLista
        );

        if (yaTieneLike) {
            throw new DuplicateResourceException("El usuario ya le dio like a esta lista");
        }

        LikeLista likeLista = new LikeLista();
        likeLista.setUsuario(usuario);
        likeLista.setLista(lista);

        return likeListaRepository.save(likeLista);
    }

    public void quitarLike(Long idLista, Long idUsuario) {

        LikeLista likeLista = likeListaRepository
                .findByUsuarioIdUsuarioAndListaIdLista(idUsuario, idLista)
                .orElseThrow(() -> new NotFoundException("Like no encontrado"));

        likeListaRepository.delete(likeLista);
    }
}