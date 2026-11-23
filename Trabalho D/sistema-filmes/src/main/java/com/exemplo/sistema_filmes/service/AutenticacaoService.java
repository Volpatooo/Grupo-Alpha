
package com.exemplo.sistema_filmes.service;

import com.exemplo.sistema_filmes.model.Usuario;
import com.exemplo.sistema_filmes.repository.UsuarioRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public AutenticacaoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario nao encontrado")
                );


String papel = usuario.getLogin().equals("admin")
        ? "ADMIN"
        : "USER";

return User.builder()
        .username(usuario.getLogin())
        .password(usuario.getSenha())
        .roles(papel)
        .build();

    }
}
