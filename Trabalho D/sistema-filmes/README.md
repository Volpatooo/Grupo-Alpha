# Sistema de Filmes — API REST

## Descrição

Projeto desenvolvido em Java com Spring Boot para realizar o gerenciamento de filmes, atores e usuários.

O sistema permite cadastrar, consultar, atualizar e excluir registros, além de relacionar filmes com seus respectivos atores.

## Tecnologias utilizadas

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- MySQL
- Maven
- Bean Validation

## Arquitetura do projeto

O sistema está organizado em camadas:

- **Model:** representa as entidades do banco de dados.
- **Repository:** realiza o acesso aos dados utilizando JPA.
- **Service:** contém as regras de negócio.
- **Controller:** disponibiliza os endpoints da API REST.
- **DTO:** controla os dados recebidos e retornados em operações de usuários.
- **Config:** contém as configurações de segurança.

## Funcionalidades

### Filmes
- Cadastrar, listar, consultar, atualizar e excluir filmes.
- Consultar filmes por gênero.
- Consultar filmes por ano de lançamento.
- Adicionar atores aos filmes.

### Atores
- Cadastrar, listar, consultar, atualizar e excluir atores.
- Consultar atores por nome.
- Consultar atores por nacionalidade.

### Usuários
- Cadastrar usuários.
- Listar e consultar usuários por ID.
- Atualizar e excluir usuários.
- Armazenar senhas utilizando BCrypt.

## Banco de dados

O projeto utiliza MySQL, com o banco `sistema_filmes`.

As principais tabelas são:

- `filme`
- `ator`
- `filme_ator`
- `usuario`

A tabela `filme_ator` representa o relacionamento muitos para muitos (N:N) entre filmes e atores.

## Segurança

A API utiliza Spring Security com autenticação HTTP Basic.

- Consultas de filmes e atores são públicas.
- Operações de cadastro, atualização e exclusão de filmes e atores exigem autenticação.
- O gerenciamento de usuários é restrito ao administrador.

## Principais endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /filmes | Listar filmes |
| GET | /filmes/{id} | Consultar filme |
| POST | /filmes | Cadastrar filme |
| PUT | /filmes/{id} | Atualizar filme |
| DELETE | /filmes/{id} | Excluir filme |
| POST | /filmes/{filmeId}/atores/{atorId} | Adicionar ator |
| GET | /filmes/genero/{genero} | Consultar por gênero |
| GET | /filmes/ano/{ano} | Consultar por ano |
| GET | /atores | Listar atores |
| GET | /atores/{id} | Consultar ator |
| POST | /atores | Cadastrar ator |
| PUT | /atores/{id} | Atualizar ator |
| DELETE | /atores/{id} | Excluir ator |
| GET | /atores/nome/{nome} | Consultar por nome |
| GET | /atores/nacionalidade/{nacionalidade} | Consultar por nacionalidade |
| GET | /usuarios | Listar usuários |
| GET | /usuarios/{id} | Consultar usuário |
| POST | /usuarios | Cadastrar usuário |
| PUT | /usuarios/{id} | Atualizar usuário |
| DELETE | /usuarios/{id} | Excluir usuário |

## Como executar

1. Instalar Java, Maven e MySQL.
2. Criar o banco de dados `sistema_filmes`.
3. Configurar a conexão no arquivo `application.properties`.
4. Abrir a pasta do projeto no VS Code.
5. Executar no terminal:

```powershell
.\mvnw.cmd spring-boot:run
```

A aplicação estará disponível em:

`http://localhost:8080`

Para criar o usuário inicial `admin`, definir a variável de ambiente `ADMIN_SENHA_INICIAL` antes da primeira execução, utilizando uma senha escolhida pelo responsável pela instalação.

## Códigos HTTP

- **200:** operação realizada com sucesso.
- **201:** recurso criado.
- **204:** exclusão realizada.
- **400:** dados inválidos.
- **401:** autenticação necessária.
- **403:** acesso não autorizado para o usuário.
- **404:** recurso não encontrado.

