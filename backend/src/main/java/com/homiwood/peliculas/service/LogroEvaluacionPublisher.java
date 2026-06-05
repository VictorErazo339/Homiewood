package com.homiwood.peliculas.service;

import com.homiwood.peliculas.event.UsuarioLogrosEvaluarEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class LogroEvaluacionPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public LogroEvaluacionPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void solicitarEvaluacion(Long idUsuario) {
        if (idUsuario == null) {
            return;
        }

        eventPublisher.publishEvent(new UsuarioLogrosEvaluarEvent(idUsuario));
    }

    public void solicitarEvaluacionVarios(Long... idsUsuarios) {
        if (idsUsuarios == null) {
            return;
        }

        Set<Long> idsUnicos = new LinkedHashSet<>();

        for (Long idUsuario : idsUsuarios) {
            if (idUsuario != null) {
                idsUnicos.add(idUsuario);
            }
        }

        for (Long idUsuario : idsUnicos) {
            solicitarEvaluacion(idUsuario);
        }
    }
}