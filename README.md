# Visy — contas e autenticação

Primeiro módulo funcional da plataforma: cadastro, login, sessão persistente e logout. A interface já segue a identidade visual da Visy e está preparada para receber o feed e a biblioteca depois.

## O que está implementado

- Cadastro com nome, usuário, e-mail e senha.
- Login com e-mail **ou** nome de usuário.
- Senhas protegidas com Argon2id; a senha original nunca é armazenada.
- Sessão de 30 dias em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção.
- O banco guarda somente o hash SHA-256 do token de sessão.
- Limite de tentativas nos endpoints de cadastro e login.
- Validação no servidor e prevenção de duplicidade de e-mail/usuário.
- PostgreSQL e Docker Compose para desenvolvimento local.

## Requisitos

- Node.js 20 ou superior.
- Docker Desktop com Docker Compose.

## Rodar no computador

1. Extraia o ZIP e abra essa pasta no VS Code.
2. Duplique `.env.example` e renomeie a cópia para `.env`.
3. No terminal, dentro da pasta do projeto, execute:

   ```bash
   docker compose up -d database
   npm install
   npm run db:migrate
   npm run dev
   ```

4. Acesse `http://localhost:3000`.

Para encerrar o servidor, use `Ctrl+C`. Para parar o banco, execute `docker compose down`.

## Organização

```text
client/                       Interface de cadastro/login
server/src/modules/auth/      Rotas, validação, regras e sessões
server/src/config/            Conexão PostgreSQL
server/src/database/          Schema e migração inicial
server/src/middleware/        Proteção de rotas autenticadas
```

## Próximas etapas de autenticação

Este primeiro corte ainda não envia e-mail de confirmação nem oferece recuperação de senha. Isso depende da escolha de um provedor de e-mail e deve ser adicionado antes de abrir o cadastro ao público. Em produção, configure `DATABASE_URL`, HTTPS, política de privacidade e uma rotina para apagar sessões expiradas.
