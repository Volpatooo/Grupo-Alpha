
package com.exemplo.sistema_filmes.repository;

import com.exemplo.sistema_filmes.model.Filme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FilmeRepository extends JpaRepository<Filme, Long> {

    List<Filme> findByGenero(String genero);

    List<Filme> findByAnoLancamento(int anoLancamento);
}
