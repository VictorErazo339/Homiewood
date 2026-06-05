package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.GuardarContenidoExternoRequest;
import com.homiwood.peliculas.dto.GuardarYAgregarContenidoRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.ContenidoGenero;
import com.homiwood.peliculas.model.Genero;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.ContenidoGeneroRepository;
import com.homiwood.peliculas.repository.GeneroRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioListaSyncService {

    private final UsuarioRepository usuarioRepository;
    private final ListaRepository listaRepository;
    private final ListaContenidoRepository listaContenidoRepository;
    private final CatalogoGuardarService catalogoGuardarService;
    private final GeneroRepository generoRepository;
    private final ContenidoGeneroRepository contenidoGeneroRepository;

    public UsuarioListaSyncService(
            UsuarioRepository usuarioRepository,
            ListaRepository listaRepository,
            ListaContenidoRepository listaContenidoRepository,
            CatalogoGuardarService catalogoGuardarService,
            GeneroRepository generoRepository,
            ContenidoGeneroRepository contenidoGeneroRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.listaRepository = listaRepository;
        this.listaContenidoRepository = listaContenidoRepository;
        this.catalogoGuardarService = catalogoGuardarService;
        this.generoRepository = generoRepository;
        this.contenidoGeneroRepository = contenidoGeneroRepository;
    }

    @Transactional
    public ListaContenido guardarContenidoUsuario(
            Long idUsuario,
            String tipoLista,
            GuardarYAgregarContenidoRequest request
    ) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        String tipoNormalizado = tipoLista.toLowerCase();
        String estado = resolverEstado(tipoNormalizado);
        String tituloLista = resolverTituloLista(tipoNormalizado);

        Lista lista = obtenerOCrearLista(usuario, tituloLista);

        Contenido contenido = catalogoGuardarService.guardarContenidoExterno(
                convertirAGuardarContenidoExternoRequest(request)
        );

        asociarGeneros(contenido, request.getGeneros());

        if (tipoNormalizado.equals("top5")) {
            return guardarEnTop5(lista, contenido, request);
        }

        return guardarEnListaNormal(lista, contenido, estado, request);
    }

    public List<ListaContenido> listarPorEstado(Long idUsuario, String estado) {
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return listaContenidoRepository.findByListaUsuarioIdUsuarioAndEstado(
                idUsuario,
                estado.toUpperCase()
        );
    }

    private ListaContenido guardarEnTop5(
            Lista lista,
            Contenido contenido,
            GuardarYAgregarContenidoRequest request
    ) {
        Integer posicion = request.getPosicion();

        if (posicion == null) {
            throw new BadRequestException("La posición es obligatoria para el Top 5");
        }

        if (posicion < 1 || posicion > 5) {
            throw new BadRequestException("La posición del Top 5 debe estar entre 1 y 5");
        }

        listaContenidoRepository.deleteByListaIdListaAndContenidoIdContenido(
                lista.getIdLista(),
                contenido.getIdContenido()
        );

        listaContenidoRepository.deleteByListaIdListaAndPosicion(
                lista.getIdLista(),
                posicion
        );

        ListaContenido nuevo = new ListaContenido();
        nuevo.setLista(lista);
        nuevo.setContenido(contenido);
        nuevo.setEstado("FAVORITO");
        nuevo.setPosicion(posicion);
        nuevo.setNotaUsuario(request.getNotaUsuario());

        return listaContenidoRepository.save(nuevo);
    }

    private ListaContenido guardarEnListaNormal(
            Lista lista,
            Contenido contenido,
            String estado,
            GuardarYAgregarContenidoRequest request
    ) {
        return listaContenidoRepository
                .findByListaIdListaAndContenidoIdContenido(
                        lista.getIdLista(),
                        contenido.getIdContenido()
                )
                .map(existente -> {
                    existente.setEstado(estado);
                    existente.setPosicion(request.getPosicion());
                    existente.setNotaUsuario(request.getNotaUsuario());
                    return listaContenidoRepository.save(existente);
                })
                .orElseGet(() -> {
                    ListaContenido nuevo = new ListaContenido();
                    nuevo.setLista(lista);
                    nuevo.setContenido(contenido);
                    nuevo.setEstado(estado);
                    nuevo.setPosicion(request.getPosicion());
                    nuevo.setNotaUsuario(request.getNotaUsuario());
                    return listaContenidoRepository.save(nuevo);
                });
    }

    private Lista obtenerOCrearLista(Usuario usuario, String titulo) {
        return listaRepository
                .findByUsuarioIdUsuarioAndTituloIgnoreCase(
                        usuario.getIdUsuario(),
                        titulo
                )
                .orElseGet(() -> {
                    Lista lista = new Lista();
                    lista.setUsuario(usuario);
                    lista.setTitulo(titulo);
                    lista.setDescripcion("Lista automática de " + titulo);
                    lista.setVisibilidad("PUBLICA");
                    return listaRepository.save(lista);
                });
    }

    private GuardarContenidoExternoRequest convertirAGuardarContenidoExternoRequest(
            GuardarYAgregarContenidoRequest request
    ) {
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

        return guardarRequest;
    }

    private void asociarGeneros(Contenido contenido, List<String> nombresGeneros) {
        if (nombresGeneros == null || nombresGeneros.isEmpty()) {
            return;
        }

        for (String nombre : nombresGeneros) {
            if (nombre == null || nombre.isBlank()) {
                continue;
            }

            String nombreNormalizado = nombre.trim();

            Genero genero = generoRepository
                    .findByNombreIgnoreCase(nombreNormalizado)
                    .orElseGet(() -> {
                        Genero nuevo = new Genero();
                        nuevo.setNombre(nombreNormalizado);
                        return generoRepository.save(nuevo);
                    });

            boolean yaExiste = contenidoGeneroRepository
                    .existsByContenidoIdContenidoAndGeneroIdGenero(
                            contenido.getIdContenido(),
                            genero.getIdGenero()
                    );

            if (!yaExiste) {
                ContenidoGenero relacion = new ContenidoGenero();
                relacion.setContenido(contenido);
                relacion.setGenero(genero);
                contenidoGeneroRepository.save(relacion);
            }
        }
    }

    private String resolverEstado(String tipoLista) {
        return switch (tipoLista.toLowerCase()) {
            case "top5" -> "FAVORITO";
            case "vistas" -> "VISTO";
            case "porver" -> "POR_VER";
            default -> throw new BadRequestException(
                    "Tipo de lista inválido. Usa top5, vistas o porver"
            );
        };
    }

    private String resolverTituloLista(String tipoLista) {
        return switch (tipoLista.toLowerCase()) {
            case "top5" -> "Top 5";
            case "vistas" -> "Vistas";
            case "porver" -> "Por ver";
            default -> throw new BadRequestException(
                    "Tipo de lista inválido. Usa top5, vistas o porver"
            );
        };
    }
}