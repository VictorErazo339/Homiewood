package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ContenidoGenero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContenidoGeneroRepository extends JpaRepository<ContenidoGenero, Long> {

    List<ContenidoGenero> findByContenidoIdContenido(Long idContenido);

    List<ContenidoGenero> findByGeneroIdGenero(Long idGenero);

    boolean existsByContenidoIdContenidoAndGeneroIdGenero(
            Long idContenido,
            Long idGenero
    );

    // =========================================================
    // MÉTODOS PARA LOGROS - PASO 3
    // GÉNEROS / GUSTOS / EXPLORACIÓN
    // =========================================================

    @Query("""
            SELECT COUNT(DISTINCT cg.genero.idGenero)
            FROM ContenidoGenero cg, ListaContenido lc
            WHERE lc.contenido.idContenido = cg.contenido.idContenido
            AND lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            """)
    long contarGenerosDistintosVistosUsuario(
            @Param("idUsuario") Long idUsuario
    );

    @Query("""
            SELECT COUNT(DISTINCT lc.contenido.idContenido)
            FROM ContenidoGenero cg, ListaContenido lc
            WHERE lc.contenido.idContenido = cg.contenido.idContenido
            AND lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            AND LOWER(cg.genero.nombre) = LOWER(:nombreGenero)
            """)
    long contarVistosPorGeneroExacto(
            @Param("idUsuario") Long idUsuario,
            @Param("nombreGenero") String nombreGenero
    );

    @Query("""
            SELECT COUNT(DISTINCT lc.contenido.idContenido)
            FROM ContenidoGenero cg, ListaContenido lc
            WHERE lc.contenido.idContenido = cg.contenido.idContenido
            AND lc.lista.usuario.idUsuario = :idUsuario
            AND UPPER(lc.estado) = 'VISTO'
            AND LOWER(cg.genero.nombre) LIKE LOWER(CONCAT('%', :textoGenero, '%'))
            """)
    long contarVistosPorGeneroSimilar(
            @Param("idUsuario") Long idUsuario,
            @Param("textoGenero") String textoGenero
    );

    @Query(value = """
            SELECT
                g.nombre AS genero,
                COUNT(DISTINCT CASE WHEN lc.estado = 'VISTO' THEN lc.id_contenido END) AS cantidadVistos,
                SUM(
                    CASE
                        WHEN lc.estado = 'FAVORITO' THEN 10
                        WHEN lc.estado = 'VISTO' THEN COALESCE(cal.puntaje, 0)
                        WHEN lc.estado = 'POR_VER' THEN 1
                        ELSE 0
                    END
                ) AS peso
            FROM lista_contenido lc
            JOIN listas l
                ON l.id_lista = lc.id_lista
            JOIN contenido_generos cg
                ON cg.id_contenido = lc.id_contenido
            JOIN generos g
                ON g.id_genero = cg.id_genero
            LEFT JOIN calificaciones cal
                ON cal.id_usuario = l.id_usuario
                AND cal.id_contenido = lc.id_contenido
            WHERE l.id_usuario = :idUsuario
            AND lc.estado IN ('FAVORITO', 'VISTO', 'POR_VER')
            GROUP BY g.nombre
            HAVING SUM(
                CASE
                    WHEN lc.estado = 'FAVORITO' THEN 10
                    WHEN lc.estado = 'VISTO' THEN COALESCE(cal.puntaje, 0)
                    WHEN lc.estado = 'POR_VER' THEN 1
                    ELSE 0
                END
            ) > 0
            ORDER BY peso DESC, cantidadVistos DESC, g.nombre ASC
            """, nativeQuery = true)
    List<GeneroLogroProjection> obtenerResumenGenerosUsuario(
            @Param("idUsuario") Long idUsuario
    );
}