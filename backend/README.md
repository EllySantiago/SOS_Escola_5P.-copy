# S.O.S. Cidade — backend e API

API REST do S.O.S. Cidade, desenvolvida com Node.js, Express, TypeScript e Prisma. A persistência principal utiliza PostgreSQL; Redis é utilizado para cache.

## Requisitos

- Node.js e npm.
- PostgreSQL.
- Redis.
- Variáveis de ambiente configuradas conforme `.env.example`.

Para desenvolvimento local, a forma mais simples é subir os serviços pela raiz do repositório:

```bash
docker compose up --build -d db redis api
```

A API fica disponível em `http://localhost:8000`.

## Variáveis de ambiente

Crie `backend/.env` a partir de `.env.example` quando executar o backend fora do Docker. Configure, no mínimo:

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `REDIS_URL` | String de conexão Redis |
| `JWT_SECRET` | Segredo forte usado para assinar tokens |
| `DATA_ENCRYPTION_KEY` | Chave de 32 bytes para criptografia de dados |
| `FRONTEND_URL` | Origem/origens web autorizadas pelo CORS, separadas por vírgula |
| `PORT` | Porta HTTP; padrão documentado no Compose: `8000` |
| `NODE_ENV` | Ambiente de execução |

Não publique `.env`, senhas, tokens, chaves privadas ou credenciais de serviços. Os valores do `docker-compose.yml` são exclusivamente para desenvolvimento local.

## Instalação e execução independente

```bash
cd backend
npm install
npm run dev
```

O script `dev` gera o Prisma Client e inicia o servidor TypeScript com nodemon. Para compilar e executar a versão compilada:

```bash
npm run build
npm start
```

O script `start` executa as migrations de produção antes de iniciar `dist/server.js`. Configure as variáveis e o banco antes de usá-lo.

## Banco de dados e seed

O schema e as migrations estão em `prisma/`. O Compose executa `prisma migrate deploy` e `prisma db seed` na inicialização do serviço API. Para operação independente, depois de configurar a conexão:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

O seed cria contas e dados de demonstração. Use-os somente em ambiente local e não exponha credenciais de teste em produção.

## Endpoints e documentação

Com a API em execução:

- Swagger UI: `http://localhost:8000/api-docs`
- Health check: `http://localhost:8000/health`
- Especificação OpenAPI: [`src/swagger.json`](src/swagger.json)

Os grupos principais de rotas são `/auth`, `/users` e `/denuncias`. Consulte o Swagger para métodos, parâmetros, esquemas de resposta e requisitos de autenticação. As rotas protegidas exigem a credencial/token conforme indicado na documentação OpenAPI.

## Testes

```bash
npm run test:unit
npm run test:coverage
```

Na raiz, os comandos de gestão de testes também estão disponíveis em `package.json`. Testes unitários não substituem a validação integrada com PostgreSQL/Redis e os fluxos de interface.

## Referências

- [README principal](../README.md)
- [README mobile](../mobile/README.md)
- [README frontend](../frontend/README.md)
- [Resumo de arquitetura e segurança](../RESUMO-ARQUITETURA-SEGURANCA.md)
