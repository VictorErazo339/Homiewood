package com.homiwood.peliculas.controller;

import com.homiwood.peliculas.model.Calificacion;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;


@Controller
public class CalificacionWebSocketController {

    @MessageMapping("/nueva-calificacion")
    @SendTo("/topic/calificaciones")
    public Calificacion nortificarCalificacion(Calificacion calificacion){
        return calificacion;
    }

}
