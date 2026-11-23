
package com.exemplo.sistema_filmes.config;

import com.exemplo.sistema_filmes.dto.UsuarioCadastroDTO;
import com.exemplo.sistema_filmes.repository.UsuarioRepository;
import com.exemplo.sistema_filmes.service.UsuarioService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UsuarioInicialConfig {

    @Bean
    public CommandLineRunner criarUsuarioInicial(
            UsuarioRepository usuarioRepository,
            UsuarioService usuarioService) {

        return args -> {

            if (!usuarioRepository.existsByLogin("admin")) {

                String senhaInicial = System.getenv("ADMIN_SENHA_INICIAL");

                if (senhaInicial == null || senhaInicial.isBlank()) {
                    System.out.println(
                        "ADMIN_SENHA_INICIAL nao definida. Usuario inicial nao criado."
                    );
                    return;
                }

                UsuarioCadastroDTO dados = new UsuarioCadastroDTO();

                dados.setNome("Administrador");
                dados.setLogin("admin");
                dados.setSenha(senhaInicial);

                usuarioService.cadastrarUsuario(dados);

                System.out.println("Usuario inicial criado com sucesso!");
            }
        };
    }
}
