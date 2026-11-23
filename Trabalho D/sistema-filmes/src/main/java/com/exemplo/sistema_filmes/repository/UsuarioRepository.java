
package com.exemplo.sistema_filmes.repository;

import com.exemplo.sistema_filmes.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar usuário pelo login
    Optional<Usuario> findByLogin(String login);

    // Verificar se o login já está cadastrado
    boolean existsByLogin(String login);
}
