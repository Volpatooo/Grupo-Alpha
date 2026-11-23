
package com.exemplo.sistema_filmes.service;

import com.exemplo.sistema_filmes.model.Filme;
import com.exemplo.sistema_filmes.model.Ator;
import com.exemplo.sistema_filmes.repository.FilmeRepository;
import com.exemplo.sistema_filmes.repository.AtorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FilmeService {

    private final FilmeRepository filmeRepository;
    private final AtorRepository atorRepository;

    public FilmeService(FilmeRepository filmeRepository,
                        AtorRepository atorRepository) {
        this.filmeRepository = filmeRepository;
        this.atorRepository = atorRepository;
    }

    // Listar todos os filmes
    public List<Filme> listarFilmes() {
        return filmeRepository.findAll();
    }

    // Buscar filme pelo ID
    public Optional<Filme> buscarFilme(Long id) {
        return filmeRepository.findById(id);
    }

    // Cadastrar filme
    public Filme cadastrarFilme(Filme filme) {
        return filmeRepository.save(filme);
    }

    // Atualizar filme
    public Optional<Filme> atualizarFilme(Long id, Filme dados) {

        Optional<Filme> resultado = filmeRepository.findById(id);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        Filme filme = resultado.get();

        filme.setTitulo(dados.getTitulo());
        filme.setGenero(dados.getGenero());
        filme.setAnoLancamento(dados.getAnoLancamento());

        return Optional.of(filmeRepository.save(filme));
    }

    // Excluir filme
    public boolean excluirFilme(Long id) {

        if (!filmeRepository.existsById(id)) {
            return false;
        }

        filmeRepository.deleteById(id);
        return true;
    }

    // Associar um ator existente a um filme
    public Optional<Filme> adicionarAtor(Long filmeId, Long atorId) {

        Optional<Filme> filmeEncontrado = filmeRepository.findById(filmeId);
        Optional<Ator> atorEncontrado = atorRepository.findById(atorId);

        if (filmeEncontrado.isEmpty() || atorEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Filme filme = filmeEncontrado.get();
        Ator ator = atorEncontrado.get();

        if (!filme.getAtores().contains(ator)) {
            filme.getAtores().add(ator);
        }

        return Optional.of(filmeRepository.save(filme));
    }

    public List<Filme> buscarPorGenero(String genero) {
        return filmeRepository.findByGenero(genero);
    }

    public List<Filme> buscarPorAno(int ano) {
        return filmeRepository.findByAnoLancamento(ano);
    }

}
