package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearListaAutenticadaRequest;
import com.homiwood.peliculas.dto.CrearListaRequest;
import com.homiwood.peliculas.dto.VistaContenidoProjection;
import com.homiwood.peliculas.dto.VistaContenidoResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ListaService {

    private final ListaRepository listaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ListaContenidoRepository listaContenidoRepository;

    public ListaService(
            ListaRepository listaRepository,
            UsuarioRepository usuarioRepository,
            ListaContenidoRepository listaContenidoRepository
    ) {
        this.listaRepository = listaRepository;
        this.usuarioRepository = usuarioRepository;
        this.listaContenidoRepository = listaContenidoRepository;
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

    public List<VistaContenidoResponse> listarVistasUsuario(
            Long idUsuario,
            String query,
            String tipo,
            String genero,
            Integer puntaje,
            Boolean sinPuntaje,
            Integer anio,
            String orden,
            int page,
            int limite
    ) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        if (puntaje != null && (puntaje < 1 || puntaje > 5)) {
            throw new BadRequestException("El puntaje debe estar entre 1 y 5");
        }

        int paginaSegura = Math.max(page, 0);
        int limiteSeguro = Math.min(Math.max(limite, 1), 60);
        int offset = paginaSegura * limiteSeguro;

        String queryLimpia = limpiarTexto(query);
        String tipoLimpio = limpiarTexto(tipo);
        String generoLimpio = limpiarTexto(genero);
        String ordenSeguro = normalizarOrden(orden);

        Integer puntajeSeguro = Boolean.TRUE.equals(sinPuntaje) ? null : puntaje;

        return listaContenidoRepository.buscarVistasUsuario(
                        idUsuario,
                        queryLimpia,
                        tipoLimpio,
                        generoLimpio,
                        puntajeSeguro,
                        sinPuntaje,
                        anio,
                        ordenSeguro,
                        limiteSeguro,
                        offset
                )
                .stream()
                .map(this::toVistaContenidoResponse)
                .toList();
    }

    private VistaContenidoResponse toVistaContenidoResponse(VistaContenidoProjection vista) {
        return new VistaContenidoResponse(
                vista.getIdListaContenido(),
                vista.getIdLista(),
                vista.getIdContenido(),
                vista.getTitulo(),
                vista.getTipoContenido(),
                vista.getDescripcion(),
                vista.getAnioEstreno(),
                vista.getFechaEstreno(),
                vista.getPosterUrl(),
                vista.getIdioma(),
                vista.getApiProvider(),
                vista.getApiId(),
                vista.getEstado(),
                vista.getNotaUsuario(),
                vista.getFechaAgregado(),
                vista.getIdCalificacion(),
                vista.getPuntajeUsuario(),
                vista.getComentarioUsuario(),
                vista.getFechaCalificacion(),
                convertirGeneros(vista.getGeneros())
        );
    }

    private List<String> convertirGeneros(String generos) {
        if (generos == null || generos.isBlank()) {
            return List.of();
        }

        return Arrays.stream(generos.split("\\|"))
                .map(String::trim)
                .filter(genero -> !genero.isBlank())
                .distinct()
                .toList();
    }

    private String limpiarTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private String normalizarOrden(String orden) {
        if (orden == null || orden.isBlank()) {
            return "RECIENTES";
        }

        String ordenNormalizado = orden.trim().toUpperCase();

        return switch (ordenNormalizado) {
            case "RECIENTES",
                 "MEJOR_CALIFICADAS",
                 "PEOR_CALIFICADAS",
                 "TITULO_ASC",
                 "TITULO_DESC",
                 "ANIO_DESC",
                 "ANIO_ASC" -> ordenNormalizado;
            default -> "RECIENTES";
        };
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
