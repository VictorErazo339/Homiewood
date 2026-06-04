package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.RecomendacionResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecomendacionService {

    private final ContenidoRepository contenidoRepository;
    private final CalificacionRepository calificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public RecomendacionService(
            ContenidoRepository contenidoRepository,
            CalificacionRepository calificacionRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.contenidoRepository = contenidoRepository;
        this.calificacionRepository = calificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<RecomendacionResponse> recomendarParaUsuario(Long idUsuario, int limite) {

        validarUsuario(idUsuario);
        validarLimite(limite);

        List<Contenido> recomendaciones =
                contenidoRepository.recomendarPorAfinidadUsuario(idUsuario, limite);

        if (!recomendaciones.isEmpty()) {
            return mapearListaSinDuplicados(
                    recomendaciones,
                    limite,
                    "Según tus gustos"
            );
        }

        recomendaciones =
                contenidoRepository.recomendarPopularesNoAgregados(idUsuario, limite);

        return mapearListaSinDuplicados(
                recomendaciones,
                limite,
                "Popular en Homiewood"
        );
    }

    public List<RecomendacionResponse> recomendarDesdeOtroUsuario(
            Long idUsuario,
            Long idOtroUsuario,
            int limite
    ) {
        validarUsuario(idUsuario);
        validarUsuario(idOtroUsuario);
        validarLimite(limite);

        if (idUsuario.equals(idOtroUsuario)) {
            throw new BadRequestException("No puedes comparar recomendaciones contigo mismo");
        }

        List<Contenido> recomendaciones =
                contenidoRepository.recomendarDesdeOtroUsuario(
                        idUsuario,
                        idOtroUsuario,
                        limite
                );

        return mapearListaSinDuplicados(
                recomendaciones,
                limite,
                "Recomendado desde las listas públicas de otro usuario"
        );
    }

    private List<RecomendacionResponse> mapearListaSinDuplicados(
            List<Contenido> contenidos,
            int limite,
            String motivo
    ) {
        return contenidos.stream()
                .collect(Collectors.toMap(
                        contenido -> normalizarTitulo(contenido.getTitulo()),
                        contenido -> contenido,
                        this::elegirMejorContenidoDuplicado,
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .limit(limite)
                .map(contenido -> mapearRespuesta(contenido, motivo))
                .toList();
    }

    private Contenido elegirMejorContenidoDuplicado(
            Contenido contenido1,
            Contenido contenido2
    ) {
        if (contenido1.getAnioEstreno() != null && contenido2.getAnioEstreno() == null) {
            return contenido1;
        }

        if (contenido1.getAnioEstreno() == null && contenido2.getAnioEstreno() != null) {
            return contenido2;
        }

        if (contenido1.getPosterUrl() != null && contenido2.getPosterUrl() == null) {
            return contenido1;
        }

        if (contenido1.getPosterUrl() == null && contenido2.getPosterUrl() != null) {
            return contenido2;
        }

        return contenido1;
    }

    private String normalizarTitulo(String titulo) {
        if (titulo == null) {
            return "";
        }

        return titulo
                .toLowerCase()
                .trim();
    }

    private RecomendacionResponse mapearRespuesta(
            Contenido contenido,
            String motivo
    ) {
        Double promedio =
                calificacionRepository.calcularPromedioPorContenido(
                        contenido.getIdContenido()
                );

        if (promedio == null) {
            promedio = 0.0;
        }

        return new RecomendacionResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                promedio,
                motivo
        );
    }

    private void validarUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new BadRequestException("El idUsuario es obligatorio");
        }

        if (!usuarioRepository.existsById(idUsuario)) {
            throw new NotFoundException("Usuario no encontrado");
        }
    }

    private void validarLimite(int limite) {
        if (limite <= 0) {
            throw new BadRequestException("El límite debe ser mayor a 0");
        }

        if (limite > 50) {
            throw new BadRequestException("El límite máximo permitido es 50");
        }
    }
}