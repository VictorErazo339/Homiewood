package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.dto.NotificacionResponse;
import com.homiwood.peliculas.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<NotificacionResponse>> listarUltimas(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(notificacionService.listarUltimas(idUsuario));
    }

    @PatchMapping("/usuario/{idUsuario}/leer")
    public ResponseEntity<Void> marcarTodasComoLeidas(@PathVariable Long idUsuario) {
        notificacionService.marcarTodasComoLeidas(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/usuario/{idUsuario}")
    public ResponseEntity<Void> eliminarTodas(@PathVariable Long idUsuario) {
        notificacionService.eliminarTodas(idUsuario);
        return ResponseEntity.noContent().build();
    }
}
