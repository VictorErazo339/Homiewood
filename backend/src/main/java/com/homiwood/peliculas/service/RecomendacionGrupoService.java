package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.RecomendacionGrupoResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.repository.CalificacionRepository;
import com.homiwood.peliculas.repository.ContenidoRepository;
import com.homiwood.peliculas.repository.GrupoMiembroRepository;
import com.homiwood.peliculas.repository.GrupoRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecomendacionGrupoService {

    private final ContenidoRepository contenidoRepository;
    private final CalificacionRepository calificacionRepository;
    private final ListaContenidoRepository listaContenidoRepository;
    private final GrupoRepository grupoRepository;
    private final GrupoMiembroRepository grupoMiembroRepository;

    public RecomendacionGrupoService(
            ContenidoRepository contenidoRepository,
            CalificacionRepository calificacionRepository,
            ListaContenidoRepository listaContenidoRepository,
            GrupoRepository grupoRepository,
            GrupoMiembroRepository grupoMiembroRepository
    ) {
        this.contenidoRepository = contenidoRepository;
        this.calificacionRepository = calificacionRepository;
        this.listaContenidoRepository = listaContenidoRepository;
        this.grupoRepository = grupoRepository;
        this.grupoMiembroRepository = grupoMiembroRepository;
    }

    public List<RecomendacionGrupoResponse> recomendarParaGrupo(Long idGrupo, int limite) {

        validarGrupo(idGrupo);
        validarLimite(limite);

        long totalMiembros = grupoMiembroRepository.countByGrupoIdGrupo(idGrupo);

        if (totalMiembros == 0) {
            throw new BadRequestException("El grupo no tiene miembros");
        }

        Map<Long, RecomendacionGrupoResponse> recomendaciones = new LinkedHashMap<>();

        List<Contenido> porInteres = contenidoRepository.recomendarPorInteresGrupo(idGrupo, limite);

        for (Contenido contenido : porInteres) {
            RecomendacionGrupoResponse response = mapearRespuesta(
                    idGrupo,
                    contenido,
                    totalMiembros,
                    "Recomendada porque uno o más miembros la tienen como pendiente, viendo o favorita"
            );

            recomendaciones.put(contenido.getIdContenido(), response);
        }

        if (recomendaciones.size() < limite) {
            int faltantes = limite - recomendaciones.size();

            List<Contenido> porGeneros = contenidoRepository.recomendarPorGenerosGrupo(idGrupo, faltantes);

            for (Contenido contenido : porGeneros) {
                if (!recomendaciones.containsKey(contenido.getIdContenido())) {
                    RecomendacionGrupoResponse response = mapearRespuesta(
                            idGrupo,
                            contenido,
                            totalMiembros,
                            "Recomendada porque coincide con géneros vistos o favoritos del grupo"
                    );

                    recomendaciones.put(contenido.getIdContenido(), response);
                }
            }
        }

        return recomendaciones.values()
                .stream()
                .sorted((a, b) -> Double.compare(b.getPuntajeGrupo(), a.getPuntajeGrupo()))
                .limit(limite)
                .toList();
    }

    private RecomendacionGrupoResponse mapearRespuesta(
            Long idGrupo,
            Contenido contenido,
            long totalMiembros,
            String motivo
    ) {
        Double promedio = calificacionRepository.calcularPromedioPorContenido(
                contenido.getIdContenido()
        );

        if (promedio == null) {
            promedio = 0.0;
        }

        int miembrosInteresados = listaContenidoRepository.contarMiembrosInteresadosEnGrupo(
                idGrupo,
                contenido.getIdContenido()
        );

        int miembrosQueYaLaVieron = listaContenidoRepository.contarMiembrosQueVieronEnGrupo(
                idGrupo,
                contenido.getIdContenido()
        );

        double puntajeGrupo = calcularPuntajeGrupo(
                promedio,
                miembrosInteresados,
                miembrosQueYaLaVieron,
                totalMiembros
        );

        return new RecomendacionGrupoResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                promedio,
                miembrosInteresados,
                miembrosQueYaLaVieron,
                totalMiembros,
                puntajeGrupo,
                motivo
        );
    }

    private double calcularPuntajeGrupo(
            Double promedio,
            int miembrosInteresados,
            int miembrosQueYaLaVieron,
            long totalMiembros
    ) {
        double base = promedio != null ? promedio : 0.0;
        double pesoInteres = miembrosInteresados * 2.0;
        double penalizacionVistos = miembrosQueYaLaVieron * 0.5;
        double bonusGrupo = totalMiembros > 0
                ? ((double) miembrosInteresados / totalMiembros) * 3.0
                : 0.0;

        return base + pesoInteres + bonusGrupo - penalizacionVistos;
    }

    private void validarGrupo(Long idGrupo) {
        if (idGrupo == null) {
            throw new BadRequestException("El idGrupo es obligatorio");
        }

        if (!grupoRepository.existsById(idGrupo)) {
            throw new NotFoundException("Grupo no encontrado");
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