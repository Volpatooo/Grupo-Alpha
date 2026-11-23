
package com.exemplo.sistema_filmes.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "O titulo e obrigatorio")
    private String titulo;

    @NotBlank(message = "O genero e obrigatorio")
    private String genero;

    @Min(value = 1888, message = "O ano deve ser maior ou igual a 1888")
    @Max(value = 2100, message = "O ano deve ser menor ou igual a 2100")
    private int anoLancamento;


    @ManyToMany
    @JoinTable(
        name = "filme_ator",
        joinColumns = @JoinColumn(name = "filme_id"),
        inverseJoinColumns = @JoinColumn(name = "ator_id")
    )
    private List<Ator> atores = new ArrayList<>();

    public Filme() {
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public int getAnoLancamento() {
        return anoLancamento;
    }

    public void setAnoLancamento(int anoLancamento) {
        this.anoLancamento = anoLancamento;
    }

    public List<Ator> getAtores() {
        return atores;
    }

    public void setAtores(List<Ator> atores) {
        this.atores = atores;
    }
}
