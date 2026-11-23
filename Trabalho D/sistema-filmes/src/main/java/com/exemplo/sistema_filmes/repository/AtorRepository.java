
package com.exemplo.sistema_filmes.repository;

import com.exemplo.sistema_filmes.model.Ator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtorRepository extends JpaRepository<Ator, Long> {

    // Buscar atores pelo nome
    List<Ator> findByNomeContainingIgnoreCase(String nome);

    // Buscar atores pela nacionalidade
    List<Ator> findByNacionalidade(String nacionalidade);
}
