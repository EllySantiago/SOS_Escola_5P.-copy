# S.O.S Cidade - Recife

Sistema de denúncias urbanas para a cidade do Recife. A plataforma permite que cidadãos registrem problemas urbanos e que gestores públicos acompanhem, filtrem e solucionem ocorrências de maneira centralizada e georreferenciada.

---

## Descrição Geral do Projeto

O S.O.S Cidade tem o objetivo de servir como ponte de comunicação sobre zeladoria urbana entre o recifense e a prefeitura ou órgãos públicos.

O cidadão pode registrar uma ocorrência, identificar o tipo de problema e o bairro e escolher se deseja informar sua identificação na denúncia. O gestor tem acesso a painel analítico, listagem de ocorrências e mapa para apoiar a priorização de ações. O mapa e o painel usam os dados retornados pela API; não há atualização em tempo real por push ou websocket.

O sistema oferece uma aplicação web e um aplicativo Expo para Android, iOS e web. Consulte [mobile/README.md](mobile/README.md) para detalhes do aplicativo móvel.

---

## Arquitetura e Tecnologias Utilizadas

O repositório contém frontend web, backend, aplicativo móvel, ETL e testes automatizados.

### Frontend web

- Framework: Next.js (App Router)
- Linguagem: TypeScript
- Estilização: TailwindCSS e componentes Shadcn/ui
- Mapas: Leaflet (React Leaflet)
- Gerenciamento de estado global: Zustand

### Backend

- Ambiente: Node.js com Express
- Linguagem: TypeScript
- ORM: Prisma
- Autenticação: JWT assinado, enviado por cookie HttpOnly no frontend web e por `Authorization: Bearer` no app móvel
- Banco de dados: PostgreSQL
- Cache: Redis (ioredis), opcional; sem `REDIS_URL`, o cache é desativado
- Tarefas agendadas: node-cron
- Proteção de dados selecionados: AES-256-GCM para nome do denunciante e descrição

### Aplicativo móvel

- Expo SDK, React Native, TypeScript e Expo Router
- Estado: Zustand e hooks React
- Componentes e telas: `mobile/src/components/` e `mobile/src/screens/routes/`
- Integrações: Expo Location, Expo Image Picker e Expo Notifications; o mapa nativo usa `react-native-maps`
- A configuração também inclui execução web. O app não declara uma PWA.

Instruções de instalação, configuração da API, execução e build EAS estão em [mobile/README.md](mobile/README.md).

---

## Estrutura de Diretórios

```text
S.O.S-Cidade/
├── backend/                      # API REST em Node.js e Express
│   ├── prisma/                   # Schema, migrations e seed
│   └── src/
│       ├── config/               # Configuração de ambiente
│       ├── controllers/          # Controladores das rotas
│       ├── jobs/                 # Tarefas agendadas
│       ├── lib/                  # Prisma, Redis e criptografia
│       ├── middlewares/          # Autenticação e autorização
│       ├── repositories/         # Persistência via Prisma
│       ├── routes/               # Rotas da API
│       └── services/             # Regras de negócio
├── frontend/                     # Aplicação web Next.js
│   ├── src/app/                  # Rotas e layouts web
│   ├── src/components/           # Componentes de interface
│   ├── src/lib/                  # Utilitários, store e cliente da API
│   └── public/
├── mobile/                       # App Expo; veja mobile/README.md
│   ├── app/                      # Rotas e layouts Expo Router
│   └── src/                      # components, constants, hooks, services,
│                                 # screens/routes, store, types e utils
├── ETL/                          # Extração Open-Meteo, MongoDB e carga SQLite
├── e2e/                          # Testes end-to-end Playwright
├── tests/                        # Testes de contrato/API Jest e Supertest
├── .github/                      # Workflows, actions, templates e scripts
├── docker-compose.yml            # PostgreSQL, Redis, API e frontend web
└── render.yaml                   # Configuração de deploy do backend na Render
```

O pipeline em `ETL/run_etl.py` busca dados históricos da API Open-Meteo para Recife, grava documentos no MongoDB, relê os dados, transforma-os com pandas e salva o resultado em SQLite. A conexão MongoDB usa `MONGODB_URI`, documentada em `ETL/.env.example`.

---

## Perfis de Usuário

1. **Denunciante (cidadão):** pode cadastrar-se, criar denúncias e consultar as denúncias vinculadas à sua conta. A interface permite optar por não exibir o nome na denúncia. A API ainda associa a denúncia à conta autenticada, mesmo quando `identificacao` é falso; portanto, isso não equivale a remover o vínculo de autoria armazenado.

2. **Gestor (poder público):** pode consultar as denúncias gerais, alterar seu status, removê-las e gerenciar a lista de gestores conforme as rotas protegidas. A interface do denunciante não oferece acesso ao conjunto geral de denúncias.

**Limite importante:** a API atual permite a qualquer usuário autenticado chamar `POST /denuncias`; a restrição de não criar denúncias para o gestor existe na interface, não como regra de perfil nessa rota. Além disso, `POST /users` é público e o backend sempre cria um usuário `DENUNCIANTE`, mesmo que o cliente envie outro perfil.

---

## Como Executar o Projeto Localmente

### Pré-requisitos

- Docker e Docker Compose
- Node.js e npm para executar testes, frontend, mobile ou backend fora do Docker
- Para o mobile, veja os requisitos de emulador e Expo Go em [mobile/README.md](mobile/README.md)

### Banco, cache, backend e frontend com Docker

O `docker-compose.yml` sobe PostgreSQL (5432), Redis (6379), backend (8000) e frontend web (3000):

```bash
docker compose up --build -d
```

O arquivo Compose atual **não configura `DATA_ENCRYPTION_KEY`**, que é obrigatória para iniciar o backend. Antes de subir o serviço, forneça essa variável no ambiente do container `api` (por exemplo, adicionando-a à seção `environment` do Compose). O valor configurado de `JWT_SECRET` no Compose é fixo e fraco; use segredos próprios, nunca esse valor em produção. Consulte a tabela de ambiente abaixo.

Após configurar as variáveis e iniciar os serviços:

- Aplicação web: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/api-docs
- Health check: http://localhost:8000/health

Para parar a stack:

```bash
docker compose down
```

### Executar o backend fora do Docker

Copie `backend/.env.example` para `backend/.env`, configure os valores e depois:

```bash
npm ci --prefix backend
npm run dev --prefix backend
```

`DATABASE_URL` deve apontar para um PostgreSQL acessível. `DIRECT_URL` também aparece no datasource do Prisma e precisa ser configurada para os comandos/migrações que a utilizam; ela não consta no `backend/.env.example` atual.

---

## Variáveis de Ambiente do Backend

Configure as variáveis no `backend/.env` local ou no ambiente do serviço hospedado. Não versione segredos reais.

| Variável | Para que serve | Obrigatória/observação |
|---|---|---|
| `DATABASE_URL` | Conexão Prisma com PostgreSQL. | Obrigatória para acessar o banco. |
| `REDIS_URL` | Conexão com Redis para cache de listagens. | Opcional no código; sem ela o cache é desativado. |
| `JWT_SECRET` | Assinatura e verificação dos JWTs. | Obrigatória; o servidor falha se estiver ausente. |
| `DATA_ENCRYPTION_KEY` | Chave AES-256-GCM para os campos criptografados das denúncias. | Obrigatória; deve conter exatamente 32 bytes, representados por 64 caracteres hexadecimais. O servidor não inicia se estiver ausente ou inválida. |
| `FRONTEND_URL` | Origens CORS adicionais, separadas por vírgula. | Opcional no código; origens locais são permitidas pela configuração padrão. |
| `PORT` | Porta HTTP do backend. | Opcional; o padrão no servidor é `8000`. |
| `NODE_ENV` | Ambiente informado nos logs e configurações de execução. | Opcional no código do servidor; Render define `production`. |

Gere valores criptograficamente aleatórios para as chaves:

```bash
openssl rand -hex 32
```

Execute o comando separadamente para `JWT_SECRET` e `DATA_ENCRYPTION_KEY`. A chave de criptografia deve permanecer estável e ser guardada com backup seguro: **perdê-la ou trocá-la torna ilegíveis os valores já criptografados** (nome do denunciante e descrição). Não regenere essa chave para uma instalação que já tenha dados.

O schema Prisma também referencia `DIRECT_URL` para conexão direta (`backend/prisma/schema.prisma`). Essa variável não está na lista solicitada pelo exemplo de ambiente atual; configure-a conforme o provedor do PostgreSQL quando necessária para migrações.

`render.yaml` não declara `DATA_ENCRYPTION_KEY`. Ela precisa ser configurada manualmente no ambiente da Render antes do serviço iniciar; sem isso o servidor encerra durante a inicialização.

---

## Seed e Contas de Teste

O seed em `backend/prisma/seed.ts` cria ou atualiza duas contas de gestor, uma conta denunciante e três denúncias fictícias. Execute dentro de `backend/` com banco configurado:

```bash
npx prisma db seed
```

Com o ambiente local em Docker, a migration e o seed são aplicados ao iniciar a API:

```powershell
docker compose up --build -d db redis api
```

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor1.teste@soscidade.com` | `Teste@123` |
| Gestor | `gestor2.teste@soscidade.com` | `Teste@123` |
| Denunciante | `denunciante.teste@soscidade.com` | `Teste@123` |

O denunciante de teste tem três denúncias identificadas como `DADO DE TESTE`, duas anônimas e uma identificada, para validar listagem, filtros e histórico. O seed não duplica denúncias quando os protocolos de teste já existem.

**Use essas contas e denúncias somente em desenvolvimento local; nunca execute o seed nem use essas credenciais em produção.** No cadastro normal, o usuário precisa aceitar explicitamente os Termos de Uso e a Política de Privacidade; a caixa começa desmarcada.

---

## Integração de Componentes Chave

### 1. Mapas

O frontend web usa Leaflet/React Leaflet. O aplicativo móvel tem mapa por meio de `react-native-maps` e coordenadas de referência em `mobile/src/constants/bairros.ts`; na web do mobile, a tela apresenta uma lista de ocorrências agrupadas por bairro.

### 2. Cache e tarefas agendadas

O backend usa Redis opcional para cache das listagens de denúncias, com expiração configurada para 60 segundos e limpeza após operações de escrita. Um cron remove chaves antigas de cache às 03:00. Outro cron registra nos logs a contagem de denúncias criadas no dia anterior; ele não implementa política de retenção nem agrega métricas persistidas.

### 3. Autenticação e autorização

O login retorna um JWT assinado com validade de 24 horas. No frontend web, ele também é colocado em cookie com flags `HttpOnly`, `Secure` e `SameSite=None`; o app móvel usa o token no header Bearer. JWT é assinado, não criptografado. O servidor valida o token e aplica verificações de perfil nas rotas onde há middleware de autorização.

---

## Rotas do Frontend Web

| Caminho da URL | Público-alvo | Funcionalidade principal |
|---|---|---|
| `/` | Visitante | Apresentação e redirecionamento de sessão |
| `/login` | Visitante | Login |
| `/cadastro` | Visitante | Cadastro |
| `/homepage-denunciante` | Denunciante | Tela inicial do cidadão |
| `/nova-denuncia` | Denunciante | Formulário de abertura de denúncia |
| `/minhas-denuncias` | Denunciante | Histórico do usuário |
| `/dashboard` | Gestor | Indicadores e filtros |
| `/denuncias-recentes` | Gestor | Lista administrativa |
| `/mapa-ocorrencias` | Gestor | Mapa de ocorrências |
| `/gestores` | Gestor | Gerenciamento de gestores na interface |

---

## Endpoints do Backend

Perfis abaixo descrevem as verificações efetivamente configuradas nas rotas do backend. “Autenticado” significa JWT válido; “público” significa que a rota não exige autenticação.

| Método | Endpoint | Perfil permitido | Contexto |
|---|---|---|---|
| GET | `/health` | Público | Health check |
| GET | `/api-docs` | Público | Swagger |
| POST | `/auth/login` | Público | Autentica e emite JWT |
| POST | `/auth/logout` | Público | Limpa o cookie; não invalida/revoga JWT já emitido |
| POST | `/users` | Público | Cria usuário; o backend atribui sempre perfil `DENUNCIANTE` |
| GET | `/users` | `GESTOR` | Lista usuários; sem parâmetro `role`, o controller retorna lista vazia |
| DELETE | `/users/:id` | `GESTOR` | Exclui usuário pelo ID |
| GET | `/denuncias` | `GESTOR` | Lista todas as denúncias; aceita paginação |
| GET | `/denuncias/minhas` | Qualquer usuário autenticado | Lista denúncias filtradas pelo ID do token |
| GET | `/denuncias/:id` | Qualquer usuário autenticado | Consulta pelo ID; não foi encontrada verificação de propriedade no controller |
| POST | `/denuncias` | Qualquer usuário autenticado | Cria denúncia associada ao ID do token |
| PATCH | `/denuncias/:id` | `GESTOR` | Atualiza a situação |
| DELETE | `/denuncias/:id` | `GESTOR` | Exclui denúncia |

Os endpoints são registrados sem prefixo `/api`. A implementação atual do controller de listagem não aplica filtros de tipo, bairro ou situação; confira as capacidades do backend antes de presumir que parâmetros de filtro são efetivos.

---

## Testes Automatizados

Os scripts da raiz delegam para as suítes abaixo. Instale as dependências do backend antes dos testes de unidade do backend e da API:

```bash
npm ci --prefix backend
```

### Testes unitários do backend

```bash
npm run test:unit --prefix backend
```

Executa Jest com `backend/jest.config.js`, incluindo testes de serviços e middlewares.

### Testes de API em `tests/`

```bash
npm run test:api
```

Executa Jest e Supertest com o backend de teste configurado em `tests/`. Também pode ser executado por `npm --prefix tests test` após instalar as dependências necessárias.

### Testes end-to-end em `e2e/`

Os testes precisam de frontend, backend, PostgreSQL e Redis em execução, normalmente via Docker Compose:

```bash
npm install --prefix e2e
npx playwright install chromium
npm run test:e2e
```

Para executar somente os testes marcados como smoke:

```bash
npm run test:e2e:smoke
```

Consulte [e2e/README.md](e2e/README.md) para pré-requisitos, seed local e execução dos testes Playwright.

### Workflows do GitHub Actions

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`unit-api.yml`](.github/workflows/unit-api.yml) | Pushes e pull requests para `main` | Executa testes unitários de frontend e backend e testes de API; publica artefatos e relatórios. Abre issue em caso de falha no push para `main`. |
| [`e2e-smoke.yml`](.github/workflows/e2e-smoke.yml) | Pull requests para `main` | Sobe PostgreSQL, Redis, backend e frontend; executa testes E2E smoke; publica resultados. |
| [`regressao-completa.yml`](.github/workflows/regressao-completa.yml) | Agendamento diário às 06:00 UTC e execução manual | Sobe a stack e executa testes unitários, API e E2E completos; publica relatórios e abre issue em caso de falha. |
| [`rotular-manutencao.yml`](.github/workflows/rotular-manutencao.yml) | Issues abertas ou editadas com formulário de manutenção | Sincroniza labels de falha, prioridade e flaky. |

O `unit-api.yml` e o `e2e-smoke.yml` indicam nos comentários que seus checks são requeridos para o quality gate da `main`. A configuração efetiva de proteção da branch no GitHub não está versionada aqui.

---

## Segurança e LGPD

### Controles comprovados no código

- **Senhas:** cadastro e seed usam bcryptjs com custo 10; o login compara a senha com o hash. A API não deve retornar o hash.
- **JWT:** token assinado com `JWT_SECRET` e validade de 24 horas. A API retorna o token no JSON e também o define em cookie `HttpOnly`, `Secure` e `SameSite=None`; o frontend web mantém uma cópia JavaScript, enquanto o app mobile o guarda no `expo-secure-store`. O middleware valida assinatura/expiração; a cópia web adicional continua sendo um risco a remover.
- **Perfis:** `authenticate` valida o JWT e `authorize` verifica `GESTOR` em rotas administrativas protegidas. Ver `backend/src/middlewares/`.
- **Criptografia em repouso:** `backend/src/lib/crypto.ts` usa AES-256-GCM para `nomeDenunciante` e `descricaoOcorrencia`. O nome e a descrição são descriptografados ao preparar respostas.
- **Opção sem identificação:** com `identificacao: false`, o backend não grava nome, retorna `"Anônimo"` e remove `userId` da resposta. O cadastro continua vinculado internamente à denúncia para permitir o histórico do titular.
- **Consentimento:** cadastro e login exigem aceite explícito dos Termos de Uso e da Política de Privacidade; o backend registra data e versão aceitas.

### Limites e pontos ainda não implementados

- A denúncia anônima continua associada internamente ao `userId` autenticado para permitir o histórico. Esse vínculo não é enviado nas respostas anônimas, mas administradores com acesso direto ao banco podem relacioná-la à conta; isso não é anonimato absoluto.
- Bairro, tipo, situação, datas, e-mail/nome da conta e imagens não são criptografados pelo helper AES atual. As imagens são guardadas como JSON de data URLs em `Denuncia.imagens`.
- Não foi encontrada limitação de tentativas de login, bloqueio progressivo ou rate limiting para autenticação.
- Não há rotina automática de retenção, expurgo ou anonimização de denúncias. O cron existente limpa cache Redis e registra contagens; não remove registros.
- Não há rota de autoexclusão de conta. Existe exclusão de usuário por gestor (`DELETE /users/:id`), mas não fluxo de solicitação/exclusão pelo titular.
- `POST /users` não exige autenticação nem autorização e sempre cria `DENUNCIANTE`.
- `POST /denuncias` exige autenticação, mas não limita o perfil ao denunciante.
- `GET /denuncias/:id` permite acesso somente ao titular ou a um gestor; a API responde 404 para outros denunciantes.
- `POST /auth/logout` limpa o cookie do navegador, mas não revoga o JWT no servidor; um token bearer emitido continua válido até expirar.
- Não foram encontrados no código comprovantes de processo de atendimento a titulares, avaliação de impacto, encarregado/DPO ou política formal de retenção; esses processos ficam **a confirmar**.

O documento de avaliação de segurança da equipe está em [Atividade Projeto Integrado -SEC.md](Atividade%20Projeto%20Integrado%20-SEC.md). Ele registra análise e requisitos, mas algumas partes podem refletir estados anteriores do código; confirme os controles atuais nos arquivos indicados acima.

---

## Infraestrutura e Deploy

### Docker Compose

O `docker-compose.yml` local usa PostgreSQL 15, Redis 7, API e frontend web. Ele contém credenciais fixas de desenvolvimento e não deve ser usado como configuração de produção. Atualmente não passa `DATA_ENCRYPTION_KEY` ao backend; adicione a variável antes de iniciar a API.

### Render

[`render.yaml`](render.yaml) configura um serviço web para o backend, região Oregon, plano gratuito, health check e comandos de build/start. As variáveis sensíveis são configuradas no dashboard da Render. O manifesto atual não declara `DATA_ENCRYPTION_KEY`; sem configurá-la manualmente, a API não inicia.

---

## Política de Branches e Merge

Os workflows de qualidade são configurados para pull requests com destino a `main`; os comentários de `unit-api.yml` e `e2e-smoke.yml` identificam esses checks como requeridos. Use pull request para propor mudanças à `main` e aguarde os checks aplicáveis.

A política oficial de nomes de branches, exigência efetiva de aprovação/revisão, número de aprovações e método de merge (merge commit, squash ou rebase) **a confirmar**: não foi encontrada configuração versionada que estabeleça esses detalhes. A proteção real da branch também depende das configurações do repositório GitHub.

---

## Documentação Relacionada

- [README do aplicativo móvel](mobile/README.md): stack, configuração `EXPO_PUBLIC_API_URL`, execução, rotas, permissões e build EAS.
- [Avaliação de segurança e LGPD](Atividade%20Projeto%20Integrado%20-SEC.md): requisitos, análise e histórico de segurança.
- [README dos testes E2E](e2e/README.md): configuração e execução Playwright.
- [Relatório da suíte de API](tests/RELATORIO_ENTREGA.md).
- Workflows e automações em [`.github/workflows/`](.github/workflows/).
