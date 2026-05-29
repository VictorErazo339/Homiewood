package com.homiwood.peliculas.service;

import com.homiwood.peliculas.dto.ComparacionGrupoResponse;
import com.homiwood.peliculas.dto.ContenidoComparadoGrupoResponse;
import com.homiwood.peliculas.exception.BadRequestException;
import com.homiwood.peliculas.exception.NotFoundException;
import com.homiwood.peliculas.model.Contenido;
import com.homiwood.peliculas.model.Grupo;
import com.homiwood.peliculas.model.GrupoMiembro;
import com.homiwood.peliculas.model.ListaContenido;
import com.homiwood.peliculas.repository.GrupoMiembroRepository;
import com.homiwood.peliculas.repository.GrupoRepository;
import com.homiwood.peliculas.repository.ListaContenidoRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComparacionGrupoService {

    private final GrupoRepository grupoRepository;
    private final GrupoMiembroRepository grupoMiembroRepository;
    private final ListaContenidoRepository listaContenidoRepository;

    public ComparacionGrupoService(
            GrupoRepository grupoRepository,
            GrupoMiembroRepository grupoMiembroRepository,
            ListaContenidoRepository listaContenidoRepository
    ) {
        this.grupoRepository = grupoRepository;
        this.grupoMiembroRepository = grupoMiembroRepository;
        this.listaContenidoRepository = listaContenidoRepository;
    }

    public ComparacionGrupoResponse compararGrupo(Long idGrupo) {

        if (idGrupo == null) {
            throw new BadRequestException("El idGrupo es obligatorio");
        }

        Grupo grupo = grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new NotFoundException("Grupo no encontrado"));

        List<GrupoMiembro> miembros = grupoMiembroRepository.findByGrupoIdGrupo(idGrupo);

        if (miembros.size() < 2) {
            throw new BadRequestException("El grupo debe tener al menos 2 miembros para comparar listas");
        }

        long totalMiembros = miembros.size();

        Map<Long, String> nombresPorUsuario = new LinkedHashMap<>();
        Map<Long, Map<Long, ListaContenido>> contenidoPorUsuario = new LinkedHashMap<>();
        Map<Long, Contenido> contenidosGlobales = new LinkedHashMap<>();

        for (GrupoMiembro miembro : miembros) {
            Long idUsuario = miembro.getUsuario().getIdUsuario();

            nombresPorUsuario.put(idUsuario, miembro.getUsuario().getNombre());

            List<ListaContenido> contenidosUsuario =
                    listaContenidoRepository.findByListaUsuarioIdUsuario(idUsuario);

            Map<Long, ListaContenido> mapaUsuario = crearMapaPreferente(contenidosUsuario);

            contenidoPorUsuario.put(idUsuario, mapaUsuario);

            for (ListaContenido item : mapaUsuario.values()) {
                contenidosGlobales.put(
                        item.getContenido().getIdContenido(),
                        item.getContenido()
                );
            }
        }

        List<ContenidoComparadoGrupoResponse> contenidoCompartido = new ArrayList<>();
        List<ContenidoComparadoGrupoResponse> paraVerJuntos = new ArrayList<>();
        List<ContenidoComparadoGrupoResponse> recomendacionesCruzadas = new ArrayList<>();
        List<ContenidoComparadoGrupoResponse> vistoPorTodos = new ArrayList<>();

        for (Contenido contenido : contenidosGlobales.values()) {

            EstadisticasGrupo estadisticas = calcularEstadisticas(
                    contenido.getIdContenido(),
                    contenidoPorUsuario,
                    nombresPorUsuario,
                    totalMiembros
            );

            if (estadisticas.miembrosQueLoTienen >= 2) {
                contenidoCompartido.add(mapearRespuesta(
                        contenido,
                        totalMiembros,
                        estadisticas,
                        "Este contenido aparece en las listas de varios miembros del grupo"
                ));
            }

            if (estadisticas.miembrosInteresados >= 2 && estadisticas.miembrosQueYaLaVieron < totalMiembros) {
                paraVerJuntos.add(mapearRespuesta(
                        contenido,
                        totalMiembros,
                        estadisticas,
                        "Varios miembros lo tienen pendiente o lo están viendo"
                ));
            }

            if (estadisticas.miembrosQueYaLaVieron >= 1 && estadisticas.miembrosSinContenido >= 1) {
                recomendacionesCruzadas.add(mapearRespuesta(
                        contenido,
                        totalMiembros,
                        estadisticas,
                        "Algunos miembros ya lo vieron o lo marcaron favorito, y otros todavía no lo tienen"
                ));
            }

            if (estadisticas.miembrosQueYaLaVieron == totalMiembros) {
                vistoPorTodos.add(mapearRespuesta(
                        contenido,
                        totalMiembros,
                        estadisticas,
                        "Todos los miembros ya lo vieron o lo marcaron como favorito"
                ));
            }
        }

        ordenarPorRelevancia(contenidoCompartido);
        ordenarPorRelevancia(paraVerJuntos);
        ordenarPorRelevancia(recomendacionesCruzadas);
        ordenarPorRelevancia(vistoPorTodos);

        return new ComparacionGrupoResponse(
                grupo.getIdGrupo(),
                grupo.getNombre(),
                totalMiembros,
                contenidoCompartido,
                paraVerJuntos,
                recomendacionesCruzadas,
                vistoPorTodos
        );
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

    private EstadisticasGrupo calcularEstadisticas(
            Long idContenido,
            Map<Long, Map<Long, ListaContenido>> contenidoPorUsuario,
            Map<Long, String> nombresPorUsuario,
            long totalMiembros
    ) {
        int miembrosQueLoTienen = 0;
        int miembrosInteresados = 0;
        int miembrosQueYaLaVieron = 0;
        int miembrosSinContenido = 0;

        Map<Long, String> estadosPorUsuario = new LinkedHashMap<>();

        for (Long idUsuario : nombresPorUsuario.keySet()) {
            Map<Long, ListaContenido> mapaUsuario = contenidoPorUsuario.get(idUsuario);
            ListaContenido item = mapaUsuario.get(idContenido);

            if (item == null) {
                miembrosSinContenido++;
                estadosPorUsuario.put(idUsuario, "NO_AGREGADO");
                continue;
            }

            String estado = item.getEstado();
            estadosPorUsuario.put(idUsuario, estado);

            miembrosQueLoTienen++;

            if (estaPendienteOViendo(estado)) {
                miembrosInteresados++;
            }

            if (esVistaOFavorita(estado)) {
                miembrosQueYaLaVieron++;
            }
        }

        return new EstadisticasGrupo(
                miembrosQueLoTienen,
                miembrosInteresados,
                miembrosQueYaLaVieron,
                miembrosSinContenido,
                estadosPorUsuario,
                nombresPorUsuario
        );
    }

    private ContenidoComparadoGrupoResponse mapearRespuesta(
            Contenido contenido,
            long totalMiembros,
            EstadisticasGrupo estadisticas,
            String motivo
    ) {
        return new ContenidoComparadoGrupoResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getAnioEstreno(),
                contenido.getPosterUrl(),
                totalMiembros,
                estadisticas.miembrosQueLoTienen,
                estadisticas.miembrosInteresados,
                estadisticas.miembrosQueYaLaVieron,
                estadisticas.miembrosSinContenido,
                estadisticas.estadosPorUsuario,
                estadisticas.nombresPorUsuario,
                motivo
        );
    }

    private void ordenarPorRelevancia(List<ContenidoComparadoGrupoResponse> lista) {
        lista.sort((a, b) -> {
            int comparacionInteres = Integer.compare(b.getMiembrosInteresados(), a.getMiembrosInteresados());

            if (comparacionInteres != 0) {
                return comparacionInteres;
            }

            int comparacionCompartido = Integer.compare(b.getMiembrosQueLoTienen(), a.getMiembrosQueLoTienen());

            if (comparacionCompartido != 0) {
                return comparacionCompartido;
            }

            return Integer.compare(a.getMiembrosQueYaLaVieron(), b.getMiembrosQueYaLaVieron());
        });
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

    private record EstadisticasGrupo(
            int miembrosQueLoTienen,
            int miembrosInteresados,
            int miembrosQueYaLaVieron,
            int miembrosSinContenido,
            Map<Long, String> estadosPorUsuario,
            Map<Long, String> nombresPorUsuario
    ) {
    }
}