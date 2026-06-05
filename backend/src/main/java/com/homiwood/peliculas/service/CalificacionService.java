package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearCalificacionRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Calificacion;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.Lista;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import com.homiwood.peliculas.repository.ListaRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ContenidoRepository contenidoRepository;
    private final ListaRepository listaRepository;
    private final ListaContenidoRepository listaContenidoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public CalificacionService(
            CalificacionRepository calificacionRepository,
            UsuarioRepository usuarioRepository,
            ContenidoRepository contenidoRepository,
            ListaRepository listaRepository,
            ListaContenidoRepository listaContenidoRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.calificacionRepository = calificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.contenidoRepository = contenidoRepository;
        this.listaRepository = listaRepository;
        this.listaContenidoRepository = listaContenidoRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Calificacion> listarCalificaciones() {
        return calificacionRepository.findAll();
    }

    public List<Calificacion> listarPorUsuario(Long idUsuario) {
        return calificacionRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public List<Calificacion> listarPorContenido(Long idContenido) {
        return calificacionRepository.findByContenidoIdContenido(idContenido);
    }

    @Transactional
    public Calificacion crearCalificacion(CrearCalificacionRequest request) {

        validarRequest(request);
        validarPuntaje(request.getPuntaje());

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Contenido contenido = contenidoRepository.findById(request.getIdContenido())
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));

        Calificacion calificacion = calificacionRepository
                .findByUsuarioIdUsuarioAndContenidoIdContenido(
                        usuario.getIdUsuario(),
                        contenido.getIdContenido()
                )
                .orElseGet(() -> {
                    Calificacion nueva = new Calificacion();
                    nueva.setUsuario(usuario);
                    nueva.setContenido(contenido);
                    return nueva;
                });

        calificacion.setPuntaje(request.getPuntaje());
        calificacion.setComentario(request.getComentario());
        calificacion.setFechaCalificacion(LocalDateTime.now());

        Calificacion guardada = calificacionRepository.save(calificacion);

        asegurarContenidoEnVistas(usuario, contenido);

        messagingTemplate.convertAndSend("/topic/calificaciones", guardada);

        return guardada;
    }

    @Transactional
    public Calificacion actualizarCalificacion(Long idCalificacion, CrearCalificacionRequest request) {

        validarRequest(request);
        validarPuntaje(request.getPuntaje());

        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
                .orElseThrow(() -> new NotFoundException("Calificación no encontrada"));

        calificacion.setPuntaje(request.getPuntaje());
        calificacion.setComentario(request.getComentario());
        calificacion.setFechaCalificacion(LocalDateTime.now());

        Calificacion guardada = calificacionRepository.save(calificacion);

        asegurarContenidoEnVistas(
                calificacion.getUsuario(),
                calificacion.getContenido()
        );

        messagingTemplate.convertAndSend("/topic/calificaciones", guardada);

        return guardada;
    }

    public Double obtenerPromedioContenido(Long idContenido) {
        Double promedio = calificacionRepository.calcularPromedioPorContenido(idContenido);
        return promedio != null ? promedio : 0.0;
    }

    public void eliminarCalificacion(Long idCalificacion) {

        if (!calificacionRepository.existsById(idCalificacion)) {
            throw new NotFoundException("Calificación no encontrada");
        }

        calificacionRepository.deleteById(idCalificacion);
    }

    private void asegurarContenidoEnVistas(Usuario usuario, Contenido contenido) {

        Lista listaVistas = listaRepository
                .findByUsuarioIdUsuarioAndTituloIgnoreCase(
                        usuario.getIdUsuario(),
                        "Vistas"
                )
                .orElseGet(() -> {
                    Lista nueva = new Lista();
                    nueva.setUsuario(usuario);
                    nueva.setTitulo("Vistas");
                    nueva.setDescripcion("Lista automática de Vistas");
                    nueva.setVisibilidad("PUBLICA");
                    return listaRepository.save(nueva);
                });

        listaContenidoRepository
                .findByListaIdListaAndContenidoIdContenido(
                        listaVistas.getIdLista(),
                        contenido.getIdContenido()
                )
                .map(existente -> {
                    existente.setEstado("VISTO");
                    existente.setPosicion(null);
                    return listaContenidoRepository.save(existente);
                })
                .orElseGet(() -> {
                    ListaContenido nuevo = new ListaContenido();
                    nuevo.setLista(listaVistas);
                    nuevo.setContenido(contenido);
                    nuevo.setEstado("VISTO");
                    nuevo.setPosicion(null);
                    return listaContenidoRepository.save(nuevo);
                });
    }

    private void validarRequest(CrearCalificacionRequest request) {
        if (request == null) {
            throw new BadRequestException("La calificación es obligatoria");
        }

        if (request.getIdUsuario() == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        if (request.getIdContenido() == null) {
            throw new BadRequestException("El idContenido es obligatorio");
        }
    }

    private void validarPuntaje(Integer puntaje) {
        if (puntaje == null) {
            throw new BadRequestException("El puntaje es obligatorio");
        }

        if (puntaje < 1 || puntaje > 5) {
            throw new BadRequestException("El puntaje debe estar entre 1 y 5");
        }
    }
}