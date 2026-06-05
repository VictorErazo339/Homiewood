package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Contenido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContenidoRepository extends JpaRepository<Contenido, Long> {

    List<Contenido> findByTipoContenido(String tipoContenido);

    List<Contenido> findByTituloContainingIgnoreCase(String titulo);

    Optional<Contenido> findByApiProviderAndApiId(String apiProvider, String apiId);

    @Query(value = """
            SELECT c.*
            FROM contenido c
            JOIN lista_contenido lc ON lc.id_contenido = c.id_contenido
            JOIN listas l ON l.id_lista = lc.id_lista
            JOIN grupo_miembros gm ON gm.id_usuario = l.id_usuario
            WHERE gm.id_grupo = :idGrupo
            AND lc.estado IN ('POR_VER', 'VIENDO', 'FAVORITO')
            AND NOT EXISTS (
                SELECT 1
                FROM grupo_miembros gm_all
                WHERE gm_all.id_grupo = :idGrupo
                AND NOT EXISTS (
                    SELECT 1
                    FROM listas l_seen
                    JOIN lista_contenido lc_seen ON lc_seen.id_lista = l_seen.id_lista
                    WHERE l_seen.id_usuario = gm_all.id_usuario
                    AND lc_seen.id_contenido = c.id_contenido
                    AND lc_seen.estado = 'VISTO'
                )
            )
            GROUP BY c.id_contenido
            ORDER BY
                COUNT(DISTINCT l.id_usuario) DESC,
                SUM(
                    CASE lc.estado
                        WHEN 'FAVORITO' THEN 3
                        WHEN 'VIENDO' THEN 2
                        WHEN 'POR_VER' THEN 1
                        ELSE 0
                    END
                ) DESC,
                c.fecha_creacion DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarPorInteresGrupo(
            @Param("idGrupo") Long idGrupo,
            @Param("limite") int limite);

    @Query(value = """
            SELECT DISTINCT c.*
            FROM contenido c
            JOIN contenido_generos cg ON cg.id_contenido = c.id_contenido
            WHERE cg.id_genero IN (
                SELECT DISTINCT cg_base.id_genero
                FROM grupo_miembros gm
                JOIN listas l ON l.id_usuario = gm.id_usuario
                JOIN lista_contenido lc ON lc.id_lista = l.id_lista
                JOIN contenido_generos cg_base ON cg_base.id_contenido = lc.id_contenido
                WHERE gm.id_grupo = :idGrupo
                AND lc.estado IN ('FAVORITO', 'VISTO')
            )
            AND NOT EXISTS (
                SELECT 1
                FROM grupo_miembros gm_all
                WHERE gm_all.id_grupo = :idGrupo
                AND NOT EXISTS (
                    SELECT 1
                    FROM listas l_seen
                    JOIN lista_contenido lc_seen ON lc_seen.id_lista = l_seen.id_lista
                    WHERE l_seen.id_usuario = gm_all.id_usuario
                    AND lc_seen.id_contenido = c.id_contenido
                    AND lc_seen.estado = 'VISTO'
                )
            )
            AND NOT EXISTS (
                SELECT 1
                FROM lista_contenido lc_existente
                JOIN listas l_existente ON l_existente.id_lista = lc_existente.id_lista
                JOIN grupo_miembros gm_existente ON gm_existente.id_usuario = l_existente.id_usuario
                WHERE gm_existente.id_grupo = :idGrupo
                AND lc_existente.id_contenido = c.id_contenido
            )
            ORDER BY c.fecha_creacion DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarPorGenerosGrupo(
            @Param("idGrupo") Long idGrupo,
            @Param("limite") int limite);

    @Query(value = """
            SELECT DISTINCT c.*
            FROM contenido c
            JOIN contenido_generos cg ON cg.id_contenido = c.id_contenido
            WHERE cg.id_genero IN (
                SELECT DISTINCT cg2.id_genero
                FROM lista_contenido lc
                JOIN listas l ON l.id_lista = lc.id_lista
                JOIN contenido_generos cg2 ON cg2.id_contenido = lc.id_contenido
                WHERE l.id_usuario = :idUsuario
                AND lc.estado IN ('FAVORITO', 'VISTO')
            )
            AND NOT EXISTS (
                SELECT 1
                FROM lista_contenido lc3
                JOIN listas l3 ON l3.id_lista = lc3.id_lista
                WHERE l3.id_usuario = :idUsuario
                AND lc3.id_contenido = c.id_contenido
            )
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarPorGustos(
            @Param("idUsuario") Long idUsuario,
            @Param("limite") int limite);

    @Query(value = """
            SELECT c.*
            FROM contenido c
            LEFT JOIN calificaciones cal ON cal.id_contenido = c.id_contenido
            WHERE NOT EXISTS (
                SELECT 1
                FROM lista_contenido lc
                JOIN listas l ON l.id_lista = lc.id_lista
                WHERE l.id_usuario = :idUsuario
                AND lc.id_contenido = c.id_contenido
            )
            GROUP BY c.id_contenido
            ORDER BY COALESCE(AVG(cal.puntaje), 0) DESC, c.fecha_creacion DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarPopularesNoAgregados(
            @Param("idUsuario") Long idUsuario,
            @Param("limite") int limite);

    @Query(value = """
            SELECT c.*
            FROM contenido c
            JOIN lista_contenido lc_otro ON lc_otro.id_contenido = c.id_contenido
            JOIN listas l_otro ON l_otro.id_lista = lc_otro.id_lista
            WHERE l_otro.id_usuario = :idOtroUsuario
            AND l_otro.visibilidad = 'PUBLICA'
            AND NOT EXISTS (
                SELECT 1
                FROM lista_contenido lc_usuario
                JOIN listas l_usuario ON l_usuario.id_lista = lc_usuario.id_lista
                WHERE l_usuario.id_usuario = :idUsuario
                AND lc_usuario.id_contenido = c.id_contenido
            )
            GROUP BY c.id_contenido
            ORDER BY MAX(
                CASE lc_otro.estado
                    WHEN 'FAVORITO' THEN 5
                    WHEN 'VISTO' THEN 4
                    WHEN 'VIENDO' THEN 3
                    WHEN 'POR_VER' THEN 2
                    ELSE 1
                END
            ) DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarDesdeOtroUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("idOtroUsuario") Long idOtroUsuario,
            @Param("limite") int limite);

    @Query(value = """
            WITH gustos AS (
                SELECT
                    cg_base.id_genero,
                    SUM(
                        CASE
                            WHEN lc.estado = 'FAVORITO' THEN 10
                            WHEN lc.estado = 'VISTO' THEN COALESCE(cal_usuario.puntaje, 0)
                            WHEN lc.estado = 'POR_VER' THEN 1
                            ELSE 0
                        END
                    ) AS peso_genero
                FROM lista_contenido lc
                JOIN listas l
                    ON l.id_lista = lc.id_lista
                JOIN contenido_generos cg_base
                    ON cg_base.id_contenido = lc.id_contenido
                LEFT JOIN calificaciones cal_usuario
                    ON cal_usuario.id_usuario = l.id_usuario
                    AND cal_usuario.id_contenido = lc.id_contenido
                WHERE l.id_usuario = :idUsuario
                AND lc.estado IN ('FAVORITO', 'VISTO', 'POR_VER')
                GROUP BY cg_base.id_genero
                HAVING SUM(
                    CASE
                        WHEN lc.estado = 'FAVORITO' THEN 10
                        WHEN lc.estado = 'VISTO' THEN COALESCE(cal_usuario.puntaje, 0)
                        WHEN lc.estado = 'POR_VER' THEN 1
                        ELSE 0
                    END
                ) > 0
            ),
            genero_dominante AS (
                SELECT MAX(peso_genero) AS peso_maximo
                FROM gustos
            ),
            promedios AS (
                SELECT
                    id_contenido,
                    AVG(puntaje) AS promedio_global
                FROM calificaciones
                GROUP BY id_contenido
            ),
            candidatos AS (
                SELECT
                    c.id_contenido,
                    SUM(gustos.peso_genero) AS score_generos,
                    COUNT(DISTINCT cg_candidato.id_genero) AS generos_match,
                    MAX(
                        CASE
                            WHEN gustos.peso_genero = genero_dominante.peso_maximo THEN 1
                            ELSE 0
                        END
                    ) AS coincide_genero_dominante,
                    COALESCE(MAX(promedios.promedio_global), 0) AS promedio_global
                FROM contenido c
                JOIN contenido_generos cg_candidato
                    ON cg_candidato.id_contenido = c.id_contenido
                JOIN gustos
                    ON gustos.id_genero = cg_candidato.id_genero
                CROSS JOIN genero_dominante
                LEFT JOIN promedios
                    ON promedios.id_contenido = c.id_contenido
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM lista_contenido lc_usuario
                    JOIN listas l_usuario
                        ON l_usuario.id_lista = lc_usuario.id_lista
                    WHERE l_usuario.id_usuario = :idUsuario
                    AND lc_usuario.id_contenido = c.id_contenido
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM contenido c2
                    JOIN lista_contenido lc_usuario2
                        ON lc_usuario2.id_contenido = c2.id_contenido
                    JOIN listas l_usuario2
                        ON l_usuario2.id_lista = lc_usuario2.id_lista
                    WHERE l_usuario2.id_usuario = :idUsuario
                    AND LOWER(TRIM(c2.titulo)) = LOWER(TRIM(c.titulo))
                )
                GROUP BY c.id_contenido
            )
            SELECT c.*
            FROM contenido c
            JOIN candidatos
                ON candidatos.id_contenido = c.id_contenido
            ORDER BY
                candidatos.coincide_genero_dominante DESC,
                candidatos.score_generos DESC,
                candidatos.generos_match DESC,
                candidatos.promedio_global DESC,
                COALESCE(c.anio_estreno, 0) DESC,
                c.fecha_creacion DESC
            LIMIT :limite
            """, nativeQuery = true)
    List<Contenido> recomendarPorAfinidadUsuario(
            @Param("idUsuario") Long idUsuario,
            @Param("limite") int limite);

    @Query(value = """
            SELECT
                g.id_genero AS "idGenero",
                g.nombre AS "genero",
                SUM(
                    CASE
                        WHEN lc.estado = 'FAVORITO' THEN 10
                        WHEN lc.estado = 'VISTO' THEN COALESCE(cal_usuario.puntaje, 0)
                        WHEN lc.estado = 'POR_VER' THEN 1
                        ELSE 0
                    END
                ) AS "peso"
            FROM lista_contenido lc
            JOIN listas l
                ON l.id_lista = lc.id_lista
            JOIN contenido_generos cg
                ON cg.id_contenido = lc.id_contenido
            JOIN generos g
                ON g.id_genero = cg.id_genero
            LEFT JOIN calificaciones cal_usuario
                ON cal_usuario.id_usuario = l.id_usuario
                AND cal_usuario.id_contenido = lc.id_contenido
            WHERE l.id_usuario = :idUsuario
            AND lc.estado IN ('FAVORITO', 'VISTO', 'POR_VER')
            GROUP BY g.id_genero, g.nombre
            HAVING SUM(
                CASE
                    WHEN lc.estado = 'FAVORITO' THEN 10
                    WHEN lc.estado = 'VISTO' THEN COALESCE(cal_usuario.puntaje, 0)
                    WHEN lc.estado = 'POR_VER' THEN 1
                    ELSE 0
                END
            ) > 0
            ORDER BY "peso" DESC, g.nombre ASC
            """, nativeQuery = true)
    List<GeneroPesoProjection> obtenerPesosGenerosUsuario(
            @Param("idUsuario") Long idUsuario);

    @Query("""
            SELECT g.nombre
            FROM ContenidoGenero cg
            JOIN cg.genero g
            WHERE cg.contenido.idContenido = :idContenido
            ORDER BY g.nombre ASC
            """)
    List<String> obtenerGenerosContenido(
            @Param("idContenido") Long idContenido);
}