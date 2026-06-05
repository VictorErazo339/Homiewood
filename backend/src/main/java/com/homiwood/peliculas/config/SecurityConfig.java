package com.homiwood.peliculas.config;

import com.homiwood.peliculas.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // Preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // WebSocket / STOMP / SockJS
                        // NO BORRAR: esto mantiene funcionando el WebSocket.
                        .requestMatchers(
                                "/ws/**",
                                "/ws/info/**",
                                "/topic/**",
                                "/app/**"
                        ).permitAll()

                        // Endpoints públicos del backend
                        .requestMatchers(
                                "/api/usuarios/**",
                                "/api/auth/**",
                                "/api/health",
                                "/api/catalogo/**",
                                "/api/recomendaciones/**",
                                "/api/calificaciones/**",
                                "/api/likes-calificacion/**",
                                "/api/comentarios-calificacion/**",

                                // Necesario para Vistas / Por ver / Top 5 / estadísticas de logros
                                "/api/listas/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}