
package com.exemplo.sistema_filmes.service;

import com.exemplo.sistema_filmes.model.Usuario;
import com.exemplo.sistema_filmes.repository.UsuarioRepository;
import com.exemplo.sistema_filmes.dto.UsuarioCadastroDTO;
import com.exemplo.sistema_filmes.dto.UsuarioRespostaDTO;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Cadastrar usuário com senha protegida
    public UsuarioRespostaDTO cadastrarUsuario(UsuarioCadastroDTO dados) {

        if (usuarioRepository.existsByLogin(dados.getLogin())) {
            throw new IllegalArgumentException("Login ja cadastrado");
        }

        Usuario usuario = new Usuario();

        usuario.setNome(dados.getNome());
        usuario.setLogin(dados.getLogin());

        String senhaCriptografada =
                passwordEncoder.encode(dados.getSenha());

        usuario.setSenha(senhaCriptografada);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return new UsuarioRespostaDTO(
                usuarioSalvo.getId(),
                usuarioSalvo.getNome(),
                usuarioSalvo.getLogin()
        );
    }

    // Buscar usuário pelo login para autenticação
    public Optional<Usuario> buscarPorLogin(String login) {
        return usuarioRepository.findByLogin(login);
    }

    // Verificar senha durante a autenticação
    public boolean verificarSenha(String senhaDigitada, String senhaSalva) {
        return passwordEncoder.matches(senhaDigitada, senhaSalva);
    }


public java.util.List<UsuarioRespostaDTO> listarUsuarios() {

    return usuarioRepository.findAll()
            .stream()
            .map(usuario -> new UsuarioRespostaDTO(
                    usuario.getId(),
                    usuario.getNome(),
                    usuario.getLogin()
            ))
            .toList();
}


public UsuarioRespostaDTO buscarPorId(Long id) {

    Usuario usuario = usuarioRepository.findById(id)
            .orElse(null);

    if (usuario == null) {
        return null;
    }

    return new UsuarioRespostaDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getLogin()
    );
}


public UsuarioRespostaDTO atualizarUsuario(
        Long id, UsuarioCadastroDTO dados) {

    Usuario usuario = usuarioRepository.findById(id)
            .orElse(null);

    if (usuario == null) {
        return null;
    }

    if (!usuario.getLogin().equals(dados.getLogin())
            && usuarioRepository.existsByLogin(dados.getLogin())) {
        throw new IllegalArgumentException("Login ja cadastrado");
    }

    usuario.setNome(dados.getNome());
    usuario.setLogin(dados.getLogin());

    if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
        usuario.setSenha(passwordEncoder.encode(dados.getSenha()));
    }

    usuarioRepository.save(usuario);

    return new UsuarioRespostaDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getLogin()
    );
}


public boolean excluirUsuario(Long id) {

    if (!usuarioRepository.existsById(id)) {
        return false;
    }

    usuarioRepository.deleteById(id);
    return true;
}

}
