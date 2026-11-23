
package com.exemplo.sistema_filmes.controller;

import com.exemplo.sistema_filmes.model.Ator;
import com.exemplo.sistema_filmes.service.AtorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/atores")
public class AtorController {

    private final AtorService atorService;

    public AtorController(AtorService atorService) {
        this.atorService = atorService;
    }

    // Listar todos os atores
    @GetMapping
    public List<Ator> listarAtores() {
        return atorService.listarAtores();
    }

    // Buscar ator pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Ator> buscarAtor(@PathVariable Long id) {
        return atorService.buscarAtor(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cadastrar ator
@PostMapping
public Ator cadastrarAtor(@Valid @RequestBody Ator ator) {
    return atorService.cadastrarAtor(ator);
}

@PutMapping("/{id}")
public ResponseEntity<Ator> atualizarAtor(
        @PathVariable Long id,
        @Valid @RequestBody Ator dados) {

    return atorService.atualizarAtor(id, dados)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    // Excluir ator
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirAtor(@PathVariable Long id) {

        if (atorService.excluirAtor(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/nome/{nome}")
    public List<Ator> buscarPorNome(@PathVariable String nome) {
        return atorService.buscarPorNome(nome);
    }

    @GetMapping("/nacionalidade/{nacionalidade}")
    public List<Ator> buscarPorNacionalidade(
            @PathVariable String nacionalidade) {

        return atorService.buscarPorNacionalidade(nacionalidade);
    }

}
