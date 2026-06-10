package com.homiwood.peliculas.repository;

import com.homiwood.peliculas.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findTop5ByUsuarioIdUsuarioOrderByFechaCreacionDesc(Long idUsuario);

    List<Notificacion> findByUsuarioIdUsuario(Long idUsuario);

    void deleteByUsuarioIdUsuario(Long idUsuario);
}
