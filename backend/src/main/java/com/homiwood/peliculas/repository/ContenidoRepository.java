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
            @Param("limite") int limite
    );

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
            @Param("limite") int limite
    );

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
            @Param("limite") int limite
    );

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
            @Param("limite") int limite
    );

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
            @Param("limite") int limite
    );
}