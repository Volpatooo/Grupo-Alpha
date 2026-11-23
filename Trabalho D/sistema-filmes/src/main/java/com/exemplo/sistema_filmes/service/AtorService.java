
package com.exemplo.sistema_filmes.service;

import com.exemplo.sistema_filmes.model.Ator;
import com.exemplo.sistema_filmes.repository.AtorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AtorService {

    private final AtorRepository atorRepository;

    public AtorService(AtorRepository atorRepository) {
        this.atorRepository = atorRepository;
    }

    // Listar todos os atores
    public List<Ator> listarAtores() {
        return atorRepository.findAll();
    }

    // Buscar ator pelo ID
    public Optional<Ator> buscarAtor(Long id) {
        return atorRepository.findById(id);
    }

    // Cadastrar ator
    public Ator cadastrarAtor(Ator ator) {
        return atorRepository.save(ator);
    }

    // Atualizar ator
    public Optional<Ator> atualizarAtor(Long id, Ator dados) {

        Optional<Ator> resultado = atorRepository.findById(id);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        Ator ator = resultado.get();
        ator.setNome(dados.getNome());
        ator.setNacionalidade(dados.getNacionalidade());

        return Optional.of(atorRepository.save(ator));
    }

    // Excluir ator
    public boolean excluirAtor(Long id) {

        if (!atorRepository.existsById(id)) {
            return false;
        }

        atorRepository.deleteById(id);
        return true;
    }

    public List<Ator> buscarPorNome(String nome) {
        return atorRepository.findByNomeContainingIgnoreCase(nome);
    }

    public List<Ator> buscarPorNacionalidade(String nacionalidade) {
        return atorRepository.findByNacionalidade(nacionalidade);
    }

}
