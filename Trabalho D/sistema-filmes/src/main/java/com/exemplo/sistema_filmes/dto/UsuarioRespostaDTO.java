
package com.exemplo.sistema_filmes.dto;

public class UsuarioRespostaDTO {

    private Long id;
    private String nome;
    private String login;

    public UsuarioRespostaDTO(Long id, String nome, String login) {
        this.id = id;
        this.nome = nome;
        this.login = login;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getLogin() {
        return login;
    }
}
