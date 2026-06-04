package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.ListaContenido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ListaContenidoRepository extends JpaRepository<ListaContenido, Long> {

    List<ListaContenido> findByListaIdLista(Long idLista);

    List<ListaContenido> findByListaUsuarioIdUsuario(Long idUsuario);

    Optional<ListaContenido> findByListaIdListaAndContenidoIdContenido(
            Long idLista,
            Long idContenido
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