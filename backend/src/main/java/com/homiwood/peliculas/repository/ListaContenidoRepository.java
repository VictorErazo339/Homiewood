package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.dto.VistaContenidoProjection;
import com.homiwood.peliculas.model.ListaContenido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ListaContenidoRepository extends JpaRepository<ListaContenido, Long> {

    List<ListaContenido> findByListaIdLista(Long idLista);

    List<ListaContenido> findByListaUsuarioIdUsuario(Long idUsuario);

    Optional<ListaContenido> findByListaIdListaAndContenidoIdContenido(
            Long idLista,
            Long idContenido
    );

    Optional<ListaContenido> findByIdListaContenidoAndListaUsuarioIdUsuario(
            Long idListaContenido,
            Long idUsuario
    );

    List<ListaContenido> findByListaUsuarioIdUsuarioAndEstado(
            Long idUsuario,
            String estado
    );

    boolean existsByListaIdListaAndContenidoIdContenido(
            Long idLista,
            Long idContenido
    );

    void deleteByListaIdListaAndPosicion(
            Long idLista,
            Integer posicion
    );

    void deleteByListaIdListaAndContenidoIdContenido(
            Long idLista,
            Long idContenido
    );

    @Query(value = """
            SELECT
                lc.id_lista_contenido AS idListaContenido,
                l.id_lista AS idLista,
                c.id_contenido AS idContenido,
                c.titulo AS titulo,
                c.tipo_contenido AS tipoContenido,
                c.descripcion AS descripcion,
                c.anio_estreno AS anioEstreno,
                c.fecha_estreno AS fechaEstreno,
                c.poster_url AS posterUrl,
                c.idioma AS idioma,
                c.api_provider AS apiProvider,
                c.api_id AS apiId,
                lc.estado AS estado,
                lc.nota_usuario AS notaUsuario,
                lc.fecha_agregado AS fechaAgregado,
                cal.id_calificacion AS idCalificacion,
                cal.puntaje AS puntajeUsuario,
                cal.comentario AS comentarioUsuario,
                cal.fecha_calificacion AS fechaCalificacion,
                COALESCE(STRING_AGG(DISTINCT g.nombre, '|' ORDER BY g.nombre), '') AS generos
            FROM lista_contenido lc
            JOIN listas l
                ON l.id_lista = lc.id_lista
            JOIN contenido c
                ON c.id_contenido = lc.id_contenido
            LEFT JOIN calificaciones cal
                ON cal.id_usuario = l.id_usuario
                AND cal.id_contenido = c.id_contenido
            LEFT JOIN contenido_generos cg
                ON cg.id_contenido = c.id_contenido
            LEFT JOIN generos g
                ON g.id_genero = cg.id_genero
            WHERE l.id_usuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            AND (
                :query IS NULL
                OR :query = ''
                OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :query, '%'))
            )
            AND (
                :tipo IS NULL
                OR :tipo = ''
                OR UPPER(c.tipo_contenido) = UPPER(:tipo)
            )
            AND (
                :genero IS NULL
                OR :genero = ''
                OR EXISTS (
                    SELECT 1
                    FROM contenido_generos cg2
                    JOIN generos g2
                        ON g2.id_genero = cg2.id_genero
                    WHERE cg2.id_contenido = c.id_contenido
                    AND LOWER(g2.nombre) = LOWER(:genero)
                )
            )
            AND (
                :puntaje IS NULL
                OR cal.puntaje = :puntaje
            )
            AND (
                :sinPuntaje IS NULL
                OR :sinPuntaje = FALSE
                OR cal.puntaje IS NULL
            )
            AND (
                :anio IS NULL
                OR c.anio_estreno = :anio
            )
            GROUP BY
                lc.id_lista_contenido,
                l.id_lista,
                c.id_contenido,
                c.titulo,
                c.tipo_contenido,
                c.descripcion,
                c.anio_estreno,
                c.fecha_estreno,
                c.poster_url,
                c.idioma,
                c.api_provider,
                c.api_id,
                lc.estado,
                lc.nota_usuario,
                lc.fecha_agregado,
                cal.id_calificacion,
                cal.puntaje,
                cal.comentario,
                cal.fecha_calificacion
            ORDER BY
                CASE WHEN :orden = 'MEJOR_CALIFICADAS' THEN cal.puntaje END DESC NULLS LAST,
                CASE WHEN :orden = 'PEOR_CALIFICADAS' THEN cal.puntaje END ASC NULLS LAST,
                CASE WHEN :orden = 'TITULO_ASC' THEN c.titulo END ASC,
                CASE WHEN :orden = 'TITULO_DESC' THEN c.titulo END DESC,
                CASE WHEN :orden = 'ANIO_DESC' THEN c.anio_estreno END DESC NULLS LAST,
                CASE WHEN :orden = 'ANIO_ASC' THEN c.anio_estreno END ASC NULLS LAST,
                CASE WHEN :orden = 'RECIENTES' THEN lc.fecha_agregado END DESC,
                lc.fecha_agregado DESC
            LIMIT :limite OFFSET :offset
            """, nativeQuery = true)
    List<VistaContenidoProjection> buscarVistasUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("query") String query,
            @Param("tipo") String tipo,
            @Param("genero") String genero,
            @Param("puntaje") Integer puntaje,
            @Param("sinPuntaje") Boolean sinPuntaje,
            @Param("anio") Integer anio,
            @Param("orden") String orden,
            @Param("limite") int limite,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT
                lc.id_lista_contenido AS idListaContenido,
                l.id_lista AS idLista,
                c.id_contenido AS idContenido,
                c.titulo AS titulo,
                c.tipo_contenido AS tipoContenido,
                c.descripcion AS descripcion,
                c.anio_estreno AS anioEstreno,
                c.fecha_estreno AS fechaEstreno,
                c.poster_url AS posterUrl,
                c.idioma AS idioma,
                c.api_provider AS apiProvider,
                c.api_id AS apiId,
                lc.estado AS estado,
                lc.nota_usuario AS notaUsuario,
                lc.fecha_agregado AS fechaAgregado,
                cal.id_calificacion AS idCalificacion,
                cal.puntaje AS puntajeUsuario,
                cal.comentario AS comentarioUsuario,
                cal.fecha_calificacion AS fechaCalificacion,
                COALESCE(STRING_AGG(DISTINCT g.nombre, '|' ORDER BY g.nombre), '') AS generos
            FROM lista_contenido lc
            JOIN listas l
                ON l.id_lista = lc.id_lista
            JOIN contenido c
                ON c.id_contenido = lc.id_contenido
            LEFT JOIN calificaciones cal
                ON cal.id_usuario = l.id_usuario
                AND cal.id_contenido = c.id_contenido
            LEFT JOIN contenido_generos cg
                ON cg.id_contenido = c.id_contenido
            LEFT JOIN generos g
                ON g.id_genero = cg.id_genero
            WHERE l.id_usuario = :idUsuario
            AND UPPER(lc.estado) = 'POR_VER'
            AND (
                :query IS NULL
                OR :query = ''
                OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :query, '%'))
            )
            AND (
                :tipo IS NULL
                OR :tipo = ''
                OR UPPER(c.tipo_contenido) = UPPER(:tipo)
            )
            AND (
                :genero IS NULL
                OR :genero = ''
                OR EXISTS (
                    SELECT 1
                    FROM contenido_generos cg2
                    JOIN generos g2
                        ON g2.id_genero = cg2.id_genero
                    WHERE cg2.id_contenido = c.id_contenido
                    AND LOWER(g2.nombre) = LOWER(:genero)
                )
            )
            AND (
                :anio IS NULL
                OR c.anio_estreno = :anio
            )
            GROUP BY
                lc.id_lista_contenido,
                l.id_lista,
                c.id_contenido,
                c.titulo,
                c.tipo_contenido,
                c.descripcion,
                c.anio_estreno,
                c.fecha_estreno,
                c.poster_url,
                c.idioma,
                c.api_provider,
                c.api_id,
                lc.estado,
                lc.nota_usuario,
                lc.fecha_agregado,
                cal.id_calificacion,
                cal.puntaje,
                cal.comentario,
                cal.fecha_calificacion
            ORDER BY
                CASE WHEN :orden = 'TITULO_ASC' THEN c.titulo END ASC,
                CASE WHEN :orden = 'TITULO_DESC' THEN c.titulo END DESC,
                CASE WHEN :orden = 'ANIO_DESC' THEN c.anio_estreno END DESC NULLS LAST,
                CASE WHEN :orden = 'ANIO_ASC' THEN c.anio_estreno END ASC NULLS LAST,
                CASE WHEN :orden = 'RECIENTES' THEN lc.fecha_agregado END DESC,
                lc.fecha_agregado DESC
            LIMIT :limite OFFSET :offset
            """, nativeQuery = true)
    List<VistaContenidoProjection> buscarPorVerUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("query") String query,
            @Param("tipo") String tipo,
            @Param("genero") String genero,
            @Param("anio") Integer anio,
            @Param("orden") String orden,
            @Param("limite") int limite,
            @Param("offset") int offset
    );

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 2
    // VISTAS / POR VER / TOP 5 / MARATÓN
    // =========================================================

    @Query("""
            SELECT COUNT(lc)
            FROM ListaContenido lc
            WHERE lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = UPPER(:estado)
            """)
    long contarPorUsuarioYEstado(
            @Param("idUsuario") Long idUsuario,
            @Param("estado") String estado
    );

    @Query("""
            SELECT COUNT(lc)
            FROM ListaContenido lc
            WHERE lc.lista.usuario.idUsuario = :idUsuario
            AND lc.posicion IS NOT NULL
            AND lc.posicion BETWEEN 1 AND 5
            """)
    long contarTop5PorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("""
            SELECT COUNT(lc)
            FROM ListaContenido lc
            WHERE lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            AND lc.fechaAgregado >= :inicio
            AND lc.fechaAgregado < :fin
            """)
    long contarVistosEnRango(
            @Param("idUsuario") Long idUsuario,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("""
            SELECT COUNT(lc)
            FROM ListaContenido lc
            WHERE lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            AND UPPER(lc.contenido.tipoContenido) = UPPER(:tipoContenido)
            """)
    long contarVistosPorTipoContenido(
            @Param("idUsuario") Long idUsuario,
            @Param("tipoContenido") String tipoContenido
    );

    @Query(value = """
            SELECT COUNT(DISTINCT l.id_usuario)
            FROM lista_contenido lc
            JOIN listas l ON l.id_lista = lc.id_lista
            JOIN grupo_miembros gm ON gm.id_usuario = l.id_usuario
            WHERE gm.id_grupo = :idGrupo
            AND lc.id_contenido = :idContenido
            AND lc.estado IN ('POR_VER', 'VIENDO', 'FAVORITO')
            """, nativeQuery = true)
    int contarMiembrosInteresadosEnGrupo(
            @Param("idGrupo") Long idGrupo,
            @Param("idContenido") Long idContenido
    );

    @Query(value = """
            SELECT COUNT(DISTINCT l.id_usuario)
            FROM lista_contenido lc
            JOIN listas l ON l.id_lista = lc.id_lista
            JOIN grupo_miembros gm ON gm.id_usuario = l.id_usuario
            WHERE gm.id_grupo = :idGrupo
            AND lc.id_contenido = :idContenido
            AND lc.estado = 'VISTO'
            """, nativeQuery = true)
    int contarMiembrosQueVieronEnGrupo(
            @Param("idGrupo") Long idGrupo,
            @Param("idContenido") Long idContenido
    );
}
