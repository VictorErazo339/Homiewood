package com.homiwood.peliculas.listener;

import com.homiwood.peliculas.event.UsuarioLogrosEvaluarEvent;
import com.homiwood.peliculas.service.LogroService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class LogroEvaluacionListener {

    private static final Logger log = LoggerFactory.getLogger(LogroEvaluacionListener.class);

    private final LogroService logroService;

    public LogroEvaluacionListener(LogroService logroService) {
        this.logroService = logroService;
    }

    @Async("logroTaskExecutor")
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void evaluarLogros(UsuarioLogrosEvaluarEvent event) {
        try {
            logroService.evaluarLogrosUsuario(event.getIdUsuario());
        } catch (RuntimeException ex) {
            log.warn(
                    "No se pudieron evaluar los logros del usuario {}: {}",
                    event.getIdUsuario(),
                    ex.getMessage()
            );
        }
    }
}