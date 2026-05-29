package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.CrearCalificacionRequest;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.DuplicateResourceException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Calificacion;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.Usuario;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;


//WebSocket -> Diego
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ContenidoRepository contenidoRepository;

    //WebSocket -> Diego
    private final SimpMessagingTemplate messagingTemplate;

    public CalificacionService(
            CalificacionRepository calificacionRepository,
            UsuarioRepository usuarioRepository,
            ContenidoRepository contenidoRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.calificacionRepository = calificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.contenidoRepository = contenidoRepository;
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

    public Calificacion crearCalificacion(CrearCalificacionRequest request) {

        validarPuntaje(request.getPuntaje());

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Contenido contenido = contenidoRepository.findById(request.getIdContenido())
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));

        boolean yaExiste = calificacionRepository.existsByUsuarioIdUsuarioAndContenidoIdContenido(
                request.getIdUsuario(),
                request.getIdContenido()
        );

        if (yaExiste) {
            throw new DuplicateResourceException("Este usuario ya calificó este contenido");
        }

        Calificacion calificacion = new Calificacion();
        calificacion.setUsuario(usuario);
        calificacion.setContenido(contenido);
        calificacion.setPuntaje(request.getPuntaje());
        calificacion.setComentario(request.getComentario());


        // WebSocket -> Diego
        Calificacion guardada = calificacionRepository.save(calificacion);
        messagingTemplate.convertAndSend("/topic/calificaciones", guardada);
        return guardada;
    }

    public Calificacion actualizarCalificacion(Long idCalificacion, CrearCalificacionRequest request) {

        validarPuntaje(request.getPuntaje());

        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
                .orElseThrow(() -> new NotFoundException("Calificación no encontrada"));

        calificacion.setPuntaje(request.getPuntaje());
        calificacion.setComentario(request.getComentario());

        return calificacionRepository.save(calificacion);
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

    private void validarPuntaje(Integer puntaje) {
        if (puntaje == null) {
            throw new BadRequestException("El puntaje es obligatorio");
        }

        if (puntaje < 1 || puntaje > 5) {
            throw new BadRequestException("El puntaje debe estar entre 1 y 5");
        }
    }
}