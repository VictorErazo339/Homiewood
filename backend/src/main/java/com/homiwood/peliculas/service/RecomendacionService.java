package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.RecomendacionResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.GeneroPesoProjection;
import com.homiwood.peliculas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

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

        LinkedHashMap<String, RecomendacionResponse> resultado = new LinkedHashMap<>();

        List<Contenido> porAfinidad =
                contenidoRepository.recomendarPorAfinidadUsuario(idUsuario, limite);

        agregarSinDuplicados(
                resultado,
                porAfinidad,
                "Según tus gustos",
                limite
        );

        if (resultado.size() < limite) {
            List<Contenido> populares =
                    contenidoRepository.recomendarPopularesNoAgregados(idUsuario, limite * 2);

            agregarSinDuplicados(
                    resultado,
                    populares,
                    "Popular en Homiewood",
                    limite
            );
        }

        return limitar(resultado, limite);
    }

    public List<GeneroPesoProjection> obtenerDebugGenerosUsuario(Long idUsuario) {
        validarUsuario(idUsuario);
        return contenidoRepository.obtenerPesosGenerosUsuario(idUsuario);
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

        LinkedHashMap<String, RecomendacionResponse> resultado = new LinkedHashMap<>();

        agregarSinDuplicados(
                resultado,
                recomendaciones,
                "Recomendado desde las listas públicas de otro usuario",
                limite
        );

        return limitar(resultado, limite);
    }

    private void agregarSinDuplicados(
            LinkedHashMap<String, RecomendacionResponse> resultado,
            List<Contenido> contenidos,
            String motivo,
            int limite
    ) {
        if (contenidos == null || contenidos.isEmpty()) {
            return;
        }

        for (Contenido contenido : contenidos) {
            if (resultado.size() >= limite) {
                return;
            }

            String clave = normalizarTitulo(contenido.getTitulo());

            if (!resultado.containsKey(clave)) {
                resultado.put(
                        clave,
                        mapearRespuesta(contenido, motivo)
                );
            }
        }
    }

    private List<RecomendacionResponse> limitar(
            LinkedHashMap<String, RecomendacionResponse> resultado,
            int limite
    ) {
        return new ArrayList<>(resultado.values())
                .stream()
                .limit(limite)
                .toList();
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

        List<String> generos =
                contenidoRepository.obtenerGenerosContenido(
                        contenido.getIdContenido()
                );

        return new RecomendacionResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                promedio,
                motivo,
                generos,
                contenido.getIdioma(),
                contenido.getDescripcion(),
                contenido.getApiProvider(),
                contenido.getApiId()
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