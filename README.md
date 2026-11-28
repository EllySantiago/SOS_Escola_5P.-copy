# S.O.S. Cidade

Sistema de registro e acompanhamento de denúncias urbanas, com foco em ocorrências de zeladoria na cidade do Recife. O cidadão registra uma ocorrência e pode acompanhar seu andamento; gestores consultam e atualizam os atendimentos conforme suas permissões.

## Documentação por componente

Comece pelo documento correspondente ao que deseja executar:

| Componente | Documentação | Conteúdo |
|---|---|---|
| Aplicativo mobile | [Mobile — instalação, execução e build](mobile/README.md) | Expo/React Native, permissões, API, testes e APK Android |
| Aplicação web | [Frontend — instalação e execução](frontend/README.md) | Next.js, variáveis de ambiente, execução e build |
| API e banco | [Backend — configuração](backend/README.md) | Express, Prisma, PostgreSQL, Redis e endpoints |
| Demonstração | [Roteiro de screencast](docs/GRAVACAO-SCREENCAST.md) | Preparação, gravação e sequência sugerida para demonstrar o aplicativo |
| Testes | [Testes E2E](e2e/README.md) e [gestão dos testes](docs/testes/gestao-testes.md) | Execução e interpretação das suítes disponíveis |
| Arquitetura e segurança | [Resumo de arquitetura e segurança](RESUMO-ARQUITETURA-SEGURANCA.md) | Componentes, fluxo de dados e limites identificados na revisão estática |

## Visão geral

| Parte | Tecnologia | Responsabilidade |
|---|---|---|
| `mobile/` | Expo, React Native, TypeScript e NativeWind | Aplicativo para Android/iOS |
| `frontend/` | Next.js e TypeScript | Aplicação web para cidadãos e gestores |
| `backend/` | Express, Prisma, PostgreSQL e Redis | API, autenticação, autorização e persistência |
| `e2e/`, `tests/` | Playwright, Jest e Supertest | Testes web, API, contratos e lógica mobile |
| `ETL/` | Python | Rotinas de extração e carga de dados auxiliares |

Mobile e frontend web consomem a API do próprio S.O.S. Cidade. A autorização efetiva deve ser aplicada no backend; esconder telas na interface não substitui as permissões da API.

## Execução local rápida

Requisitos: Docker Desktop, Node.js LTS e npm.

Na raiz do repositório:

```bash
docker compose up --build -d
```

Endereços locais:

- Frontend web: `http://localhost:3000`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/api-docs`
- Health check: `http://localhost:8000/health`

Para executar o aplicativo, siga [mobile/README.md](mobile/README.md). Para executar apenas o frontend, consulte [frontend/README.md](frontend/README.md). Para configuração de produção, use variáveis próprias do ambiente e nunca reutilize as credenciais fixas do `docker-compose.yml`.

## Testes

Os scripts de teste disponíveis estão descritos em [package.json](package.json), [docs/testes/gestao-testes.md](docs/testes/gestao-testes.md) e nos READMEs de cada componente. A execução de testes unitários ou de integração HTTP não comprova, por si só, que o aplicativo foi instalado e validado em um aparelho físico.

## Limites conhecidos

A documentação técnica registra limitações encontradas no código desta cópia, inclusive sobre armazenamento local, notificações, proteção de dados e regras de transição de situação. Não interprete configuração de build, dependências instaladas ou testes automatizados como prova de publicação ou homologação. Consulte [RESUMO-ARQUITETURA-SEGURANCA.md](RESUMO-ARQUITETURA-SEGURANCA.md) e [mobile/docs/seguranca/seguranca-lgpd.md](mobile/docs/seguranca/seguranca-lgpd.md).

## Link para download:
APK:https://drive.google.com/drive/folders/1tY17Ch1BLtt87c6OOn8fbTwHzvn1P_8y?usp=sharing
dentro tem o aplicativo, baixe com a permissão de baixar qualquer arquivo do navegador ativada
