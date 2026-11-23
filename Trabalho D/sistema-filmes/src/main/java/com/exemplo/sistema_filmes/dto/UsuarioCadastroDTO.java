
package com.exemplo.sistema_filmes.dto;

import jakarta.validation.constraints.NotBlank;

public class UsuarioCadastroDTO {

    @NotBlank(message = "O nome e obrigatorio")
    private String nome;

    @NotBlank(message = "O login e obrigatorio")
    private String login;

    @NotBlank(message = "A senha e obrigatoria")
    private String senha;

    public UsuarioCadastroDTO() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
