
package com.exemplo.sistema_filmes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Consultas de filmes e atores são públicas
                .requestMatchers(HttpMethod.GET,
                        "/filmes/**", "/atores/**").permitAll()

                // Gerenciamento de usuários: somente administrador
                .requestMatchers("/usuarios", "/usuarios/**")
                        .hasRole("ADMIN")

                // Cadastro e atualização de filmes e atores
                .requestMatchers(HttpMethod.POST,
                        "/filmes/**", "/atores/**").authenticated()

                .requestMatchers(HttpMethod.PUT,
                        "/filmes/**", "/atores/**").authenticated()


.requestMatchers(HttpMethod.DELETE,
        "/filmes/**", "/atores/**").authenticated()


                // Outras operações exigem autenticação
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {});

        return http.build();
    }
}
