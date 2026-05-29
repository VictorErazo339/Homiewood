package com.homiwood.peliculas.mapper;

import com.homiwood.peliculas.dto.*;
import com.homiwood.peliculas.model.*;
import org.springframework.stereotype.Component;

@Component
public class ResponseMapper {

    public UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getFechaCreacion()
        );
    }

    public ContenidoResponse toContenidoResponse(Contenido contenido) {
        return new ContenidoResponse(
                contenido.getIdContenido(),
                contenido.getTitulo(),
                contenido.getTipoContenido(),
                contenido.getDescripcion(),
                contenido.getAnioEstreno(),
                contenido.getFechaEstreno(),
                contenido.getDuracionMinutos(),
                contenido.getClasificacionEdad(),
                contenido.getPosterUrl(),
                contenido.getPais(),
                contenido.getIdioma(),
                contenido.getApiProvider(),
                contenido.getApiId()
        );
    }

    public ListaResponse toListaResponse(Lista lista) {
        return new ListaResponse(
                lista.getIdLista(),
                lista.getTitulo(),
                lista.getDescripcion(),
                lista.getVisibilidad(),
                lista.getFechaCreacion(),
                lista.getFechaActualizacion(),
                lista.getUsuario().getIdUsuario(),
                lista.getUsuario().getNombre(),
                lista.getUsuario().getUsername()
        );
    }

    public ListaContenidoResponse toListaContenidoResponse(ListaContenido listaContenido) {
        return new ListaContenidoResponse(
                listaContenido.getIdListaContenido(),
                listaContenido.getLista().getIdLista(),
                listaContenido.getLista().getTitulo(),
                listaContenido.getContenido().getIdContenido(),
                listaContenido.getContenido().getTitulo(),
                listaContenido.getContenido().getTipoContenido(),
                listaContenido.getContenido().getAnioEstreno(),
                listaContenido.getContenido().getPosterUrl(),
                listaContenido.getPosicion(),
                listaContenido.getEstado(),
                listaContenido.getNotaUsuario(),
                listaContenido.getFechaAgregado()
        );
    }

    public GeneroResponse toGeneroResponse(Genero genero) {
        return new GeneroResponse(
                genero.getIdGenero(),
                genero.getNombre()
        );
    }

    public ContenidoGeneroResponse toContenidoGeneroResponse(ContenidoGenero contenidoGenero) {
        return new ContenidoGeneroResponse(
                contenidoGenero.getIdContenidoGenero(),
                contenidoGenero.getContenido().getIdContenido(),
                contenidoGenero.getContenido().getTitulo(),
                contenidoGenero.getGenero().getIdGenero(),
                contenidoGenero.getGenero().getNombre()
        );
    }

    public CalificacionResponse toCalificacionResponse(Calificacion calificacion) {
        return new CalificacionResponse(
                calificacion.getIdCalificacion(),
                calificacion.getUsuario().getIdUsuario(),
                calificacion.getUsuario().getNombre(),
                calificacion.getUsuario().getUsername(),
                calificacion.getContenido().getIdContenido(),
                calificacion.getContenido().getTitulo(),
                calificacion.getContenido().getTipoContenido(),
                calificacion.getContenido().getPosterUrl(),
                calificacion.getPuntaje(),
                calificacion.getComentario(),
                calificacion.getFechaCalificacion()
        );
    }

    public LikeListaResponse toLikeListaResponse(LikeLista likeLista) {
        return new LikeListaResponse(
                likeLista.getIdLike(),
                likeLista.getUsuario().getIdUsuario(),
                likeLista.getUsuario().getNombre(),
                likeLista.getUsuario().getUsername(),
                likeLista.getLista().getIdLista(),
                likeLista.getLista().getTitulo(),
                likeLista.getFechaLike()
        );
    }

    public SeguimientoResponse toSeguimientoResponse(Seguimiento seguimiento) {
        return new SeguimientoResponse(
                seguimiento.getIdSeguimiento(),
                seguimiento.getSeguidor().getIdUsuario(),
                seguimiento.getSeguidor().getNombre(),
                seguimiento.getSeguidor().getUsername(),
                seguimiento.getSeguido().getIdUsuario(),
                seguimiento.getSeguido().getNombre(),
                seguimiento.getSeguido().getUsername(),
                seguimiento.getFechaSeguimiento()
        );
    }

    public GrupoResponse toGrupoResponse(Grupo grupo) {
        return new GrupoResponse(
                grupo.getIdGrupo(),
                grupo.getNombre(),
                grupo.getDescripcion(),
                grupo.getCreador().getIdUsuario(),
                grupo.getCreador().getNombre(),
                grupo.getCreador().getUsername(),
                grupo.getFechaCreacion()
        );
    }

    public GrupoMiembroResponse toGrupoMiembroResponse(GrupoMiembro grupoMiembro) {
        return new GrupoMiembroResponse(
                grupoMiembro.getIdGrupoMiembro(),
                grupoMiembro.getGrupo().getIdGrupo(),
                grupoMiembro.getGrupo().getNombre(),
                grupoMiembro.getUsuario().getIdUsuario(),
                grupoMiembro.getUsuario().getNombre(),
                grupoMiembro.getUsuario().getUsername(),
                grupoMiembro.getRol(),
                grupoMiembro.getFechaUnion()
        );
    }
    public ComentarioListaResponse toComentarioListaResponse(ComentarioLista comentarioLista) {
        return new ComentarioListaResponse(
                comentarioLista.getIdComentario(),
                comentarioLista.getLista().getIdLista(),
                comentarioLista.getLista().getTitulo(),
                comentarioLista.getUsuario().getIdUsuario(),
                comentarioLista.getUsuario().getNombre(),
                comentarioLista.getUsuario().getUsername(),
                comentarioLista.getComentario(),
                comentarioLista.getFechaComentario(),
                comentarioLista.getFechaActualizacion()
        );
    }
}