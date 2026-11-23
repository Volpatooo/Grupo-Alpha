
package com.exemplo.sistema_filmes.controller;

import com.exemplo.sistema_filmes.model.Filme;
import com.exemplo.sistema_filmes.service.FilmeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/filmes")
public class FilmeController {

    private final FilmeService filmeService;

    public FilmeController(FilmeService filmeService) {
        this.filmeService = filmeService;
    }

    @GetMapping
    public List<Filme> listarFilmes() {
        return filmeService.listarFilmes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Filme> buscarFilme(@PathVariable Long id) {
        return filmeService.buscarFilme(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Filme cadastrarFilme(@Valid @RequestBody Filme filme) {
        return filmeService.cadastrarFilme(filme);
    }
 @PutMapping("/{id}")
public ResponseEntity<Filme> atualizarFilme(
        @PathVariable Long id,
        @Valid @RequestBody Filme dados) {

    return filmeService.atualizarFilme(id, dados)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirFilme(@PathVariable Long id) {

        if (filmeService.excluirFilme(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }


@PostMapping("/{filmeId}/atores/{atorId}")
public ResponseEntity<Filme> adicionarAtor(
        @PathVariable Long filmeId,
        @PathVariable Long atorId) {

    return filmeService.adicionarAtor(filmeId, atorId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    @GetMapping("/genero/{genero}")
    public List<Filme> buscarPorGenero(@PathVariable String genero) {
        return filmeService.buscarPorGenero(genero);
    }

    @GetMapping("/ano/{ano}")
    public List<Filme> buscarPorAno(@PathVariable int ano) {
        return filmeService.buscarPorAno(ano);
    }

}
