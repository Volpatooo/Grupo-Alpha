
package com.exemplo.sistema_filmes.controller;

import com.exemplo.sistema_filmes.dto.UsuarioCadastroDTO;
import com.exemplo.sistema_filmes.dto.UsuarioRespostaDTO;
import com.exemplo.sistema_filmes.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioRespostaDTO> cadastrar(
            @Valid @RequestBody UsuarioCadastroDTO dados) {

        UsuarioRespostaDTO usuario =
                usuarioService.cadastrarUsuario(dados);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuario);
    }


@GetMapping
public ResponseEntity<java.util.List<UsuarioRespostaDTO>> listar() {

    return ResponseEntity.ok(usuarioService.listarUsuarios());
}


@GetMapping("/{id}")
public ResponseEntity<UsuarioRespostaDTO> buscarPorId(
        @PathVariable Long id) {

    UsuarioRespostaDTO usuario = usuarioService.buscarPorId(id);

    if (usuario == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(usuario);
}


@PutMapping("/{id}")
public ResponseEntity<UsuarioRespostaDTO> atualizar(
        @PathVariable Long id,
        @Valid @RequestBody UsuarioCadastroDTO dados) {

    UsuarioRespostaDTO usuario =
            usuarioService.atualizarUsuario(id, dados);

    if (usuario == null) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(usuario);
}


@DeleteMapping("/{id}")
public ResponseEntity<Void> excluir(@PathVariable Long id) {

    boolean excluido = usuarioService.excluirUsuario(id);

    if (!excluido) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.noContent().build();
}

}
