# S.O.S. Cidade — frontend web

Aplicação web do S.O.S. Cidade, construída com Next.js, React e TypeScript. O frontend atende os fluxos de cidadãos e gestores e consome a API do projeto.

## Requisitos

- Node.js compatível com o projeto.
- npm.
- API do S.O.S. Cidade acessível (local ou publicada).

## Configuração local

Na pasta `frontend/`, copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Para executar junto com a infraestrutura Docker, prefira seguir o procedimento da raiz do repositório. O Compose já injeta `NEXT_PUBLIC_API_URL=http://localhost:8000` no serviço web.

## Instalação e execução independente

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
npm run lint
npm run build
npm run start
```

O comando `start` serve o build já gerado. A variável `NEXT_PUBLIC_API_URL` é incorporada ao bundle durante o build; configure-a corretamente antes de compilar.

## Principais áreas da aplicação

- `/`: página pública inicial.
- `/login`: autenticação.
- `/(denunciante)/homepage-denunciante`: área do cidadão.
- `/(denunciante)/nova-denuncia`: formulário de ocorrência.
- `/(denunciante)/minhas-denuncias`: acompanhamento das próprias ocorrências.
- `/(gestor)/dashboard`: painel do gestor.
- `/(gestor)/denuncias-recentes`: consulta e atualização das ocorrências.
- `/(gestor)/mapa-ocorrencias`: visualização geográfica.
- `/(gestor)/gestores`: gestão de contas de gestor.

Os caminhos internos com grupos entre parênteses são organizados pelo App Router; consulte os arquivos em `src/app/` para confirmar a rota pública efetiva.

## API e documentação

Com o backend local em execução:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api-docs`
- Health check: `http://localhost:8000/health`

A documentação OpenAPI de origem está em `backend/src/swagger.json`.

## Observações

- A interface não substitui autenticação e autorização no backend.
- Para testar fluxos completos, use contas de desenvolvimento e dados não sensíveis.
- Consulte o [README principal](../README.md), o [README do mobile](../mobile/README.md) e o [resumo de arquitetura e segurança](../RESUMO-ARQUITETURA-SEGURANCA.md).
