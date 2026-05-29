package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ComparacionUsuariosResponse;
import com.homiwood.peliculas.dto.ContenidoComparadoResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComparacionUsuarioService {

    private final ListaContenidoRepository listaContenidoRepository;
    private final UsuarioRepository usuarioRepository;

    public ComparacionUsuarioService(
            ListaContenidoRepository listaContenidoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.listaContenidoRepository = listaContenidoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ComparacionUsuariosResponse compararUsuarios(Long idUsuario1, Long idUsuario2) {

        validarUsuarios(idUsuario1, idUsuario2);

        List<ListaContenido> contenidosUsuario1 =
                listaContenidoRepository.findByListaUsuarioIdUsuario(idUsuario1);

        List<ListaContenido> contenidosUsuario2 =
                listaContenidoRepository.findByListaUsuarioIdUsuario(idUsuario2);

        Map<Long, ListaContenido> mapaUsuario1 = crearMapaPreferente(contenidosUsuario1);
        Map<Long, ListaContenido> mapaUsuario2 = crearMapaPreferente(contenidosUsuario2);

        List<ContenidoComparadoResponse> contenidoEnComun = new ArrayList<>();
        List<ContenidoComparadoResponse> paraVerJuntos = new ArrayList<>();
        List<ContenidoComparadoResponse> recomendacionesParaUsuario1 = new ArrayList<>();
        List<ContenidoComparadoResponse> recomendacionesParaUsuario2 = new ArrayList<>();
        List<ContenidoComparadoResponse> ambosYaVieron = new ArrayList<>();

        for (Long idContenido : mapaUsuario1.keySet()) {
            if (mapaUsuario2.containsKey(idContenido)) {
                ListaContenido item1 = mapaUsuario1.get(idContenido);
                ListaContenido item2 = mapaUsuario2.get(idContenido);

                contenidoEnComun.add(mapearComparacion(
                        item1,
                        item2,
                        "Ambos tienen este contenido en sus listas"
                ));

                if (estaPendienteOViendo(item1.getEstado()) && estaPendienteOViendo(item2.getEstado())) {
                    paraVerJuntos.add(mapearComparacion(
                            item1,
                            item2,
                            "Ambos lo tienen pendiente o lo están viendo"
                    ));
                }

                if (esVistaOFavorita(item1.getEstado()) && esVistaOFavorita(item2.getEstado())) {
                    ambosYaVieron.add(mapearComparacion(
                            item1,
                            item2,
                            "Ambos ya lo vieron o lo marcaron como favorito"
                    ));
                }
            }
        }

        for (Long idContenido : mapaUsuario2.keySet()) {
            if (!mapaUsuario1.containsKey(idContenido)) {
                ListaContenido item2 = mapaUsuario2.get(idContenido);

                if (esRecomendable(item2.getEstado())) {
                    recomendacionesParaUsuario1.add(mapearRecomendacionUnilateral(
                            item2,
                            null,
                            item2.getEstado(),
                            "El usuario 2 lo tiene como visto o favorito, y el usuario 1 no lo tiene"
                    ));
                }
            }
        }

        for (Long idContenido : mapaUsuario1.keySet()) {
            if (!mapaUsuario2.containsKey(idContenido)) {
                ListaContenido item1 = mapaUsuario1.get(idContenido);

                if (esRecomendable(item1.getEstado())) {
                    recomendacionesParaUsuario2.add(mapearRecomendacionUnilateral(
                            item1,
                            item1.getEstado(),
                            null,
                            "El usuario 1 lo tiene como visto o favorito, y el usuario 2 no lo tiene"
                    ));
                }
            }
        }

        return new ComparacionUsuariosResponse(
                idUsuario1,
                idUsuario2,
                contenidoEnComun,
                paraVerJuntos,
                recomendacionesParaUsuario1,
                recomendacionesParaUsuario2,
                ambosYaVieron
        );
    }

    private void validarUsuarios(Long idUsuario1, Long idUsuario2) {
        if (idUsuario1 == null || idUsuario2 == null) {
            throw new BadRequestException("Los IDs de usuario son obligatorios");
        }

        if (idUsuario1.equals(idUsuario2)) {
            throw new BadRequestException("No puedes comparar el mismo usuario");
        }

        if (!usuarioRepository.existsById(idUsuario1)) {
            throw new NotFoundException("Usuario 1 no encontrado");
        }

        if (!usuarioRepository.existsById(idUsuario2)) {
            throw new NotFoundException("Usuario 2 no encontrado");
        }
    }

    private Map<Long, ListaContenido> crearMapaPreferente(List<ListaContenido> contenidos) {
        Map<Long, ListaContenido> mapa = new HashMap<>();

        for (ListaContenido item : contenidos) {
            Long idContenido = item.getContenido().getIdContenido();

            if (!mapa.containsKey(idContenido)) {
                mapa.put(idContenido, item);
            } else {
                ListaContenido actual = mapa.get(idContenido);

                if (prioridadEstado(item.getEstado()) > prioridadEstado(actual.getEstado())) {
                    mapa.put(idContenido, item);
                }
            }
        }

        return mapa;
    }

    private int prioridadEstado(String estado) {
        if (estado == null) {
            return 0;
        }

        return switch (estado.toUpperCase()) {
            case "FAVORITO" -> 5;
            case "POR_VER" -> 4;
            case "VIENDO" -> 3;
            case "VISTO" -> 2;
            case "ABANDONADO" -> 1;
            default -> 0;
        };
    }

    private boolean estaPendienteOViendo(String estado) {
        if (estado == null) {
            return false;
        }

        String normalizado = estado.toUpperCase();

        return normalizado.equals("POR_VER") || normalizado.equals("VIENDO");
    }

    private boolean esVistaOFavorita(String estado) {
        if (estado == null) {
            return false;
        }

        String normalizado = estado.toUpperCase();

        return normalizado.equals("VISTO") || normalizado.equals("FAVORITO");
    }

    private boolean esRecomendable(String estado) {
        if (estado == null) {
            return false;
        }

        String normalizado = estado.toUpperCase();

        return normalizado.equals("VISTO") || normalizado.equals("FAVORITO");
    }

    private ContenidoComparadoResponse mapearComparacion(
            ListaContenido item1,
            ListaContenido item2,
            String motivo
    ) {
        Contenido contenido = item1.getContenido();

        return new ContenidoComparadoResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                item1.getEstado(),
                item2.getEstado(),
                item1.getNotaUsuario(),
                item2.getNotaUsuario(),
                motivo
        );
    }

    private ContenidoComparadoResponse mapearRecomendacionUnilateral(
            ListaContenido item,
            String estadoUsuario1,
            String estadoUsuario2,
            String motivo
    ) {
        Contenido contenido = item.getContenido();

        return new ContenidoComparadoResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                estadoUsuario1,
                estadoUsuario2,
                estadoUsuario1 != null ? item.getNotaUsuario() : null,
                estadoUsuario2 != null ? item.getNotaUsuario() : null,
                motivo
        );
    }
}