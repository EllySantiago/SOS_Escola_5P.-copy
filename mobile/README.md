# SOS-Cidade Mobile

Aplicativo do SOS-Cidade para Android, iOS e web. O projeto usa Expo Router e compartilha a API do backend.

## 1. Visao geral

O app atende dois perfis:

- **Cidadao/denunciante:** cria uma conta, registra problemas urbanos, pode anexar fotos e informar o bairro, recebe um protocolo e acompanha a situacao das proprias denuncias.
- **Gestor:** consulta e filtra denuncias, ve ocorrencias no mapa e no dashboard e altera a situacao. Tambem pode consultar e remover gestores cadastrados. A criacao de gestor pela tela existe, mas o backend atual cria sempre um usuario `DENUNCIANTE`; veja Pendencias.

A tela inicial publica apresenta o servico e encaminha para login ou cadastro.

## 2. Tecnologias e versoes

Versoes conforme as declaracoes em `package.json`:

| Tecnologia | Versao declarada |
|---|---:|
| Expo / SDK | `~58.0.26` |
| React | `19.3.1` |
| React Native | `0.88.1` |
| TypeScript | `~6.0.3` |
| Expo Router | `~58.0.32` |
| Zustand | `^5.0.13` |
| NativeWind | `^4.2.4` |
| expo-camera | `~58.0.14` |
| expo-image-picker | `~58.0.10` |
| expo-location | `~58.0.22` |
| expo-notifications | `~58.1.9` |
| react-native-maps | `1.29.11` |
| react-native-web | `^0.21.4` |

O `app.json` configura o bundler Metro para web, e `package.json` oferece o script `npm run web`. Portanto, web esta configurado; o repositorio nao o declara como PWA. NativeWind esta configurado no Babel/Metro e em `global.css`; as telas atuais usam principalmente `StyleSheet`.

## 3. Pre-requisitos

- Node.js e npm. O `package.json` do app nao fixa uma versao de Node.
- Uma instalacao do Expo Go para executar o projeto sem build nativo, respeitando as limitacoes abaixo.
- Para emulacao: Android Studio e um emulador Android configurado; para iOS, macOS com Xcode e simulador iOS.
- Um development build e EAS CLI sao necessarios para compilar e testar o cliente nativo de desenvolvimento.

## 4. Configuracao da API

Copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL`:

```sh
cp .env.example .env
```

O valor de desenvolvimento local no exemplo e `http://localhost:8000`, que corresponde a porta configurada para o backend. Em um celular fisico, `localhost` aponta para o proprio celular: use o IP local da maquina que executa o backend, acessivel na mesma rede, ou a URL hospedada `https://s-o-s-cidade-1.onrender.com`.

Os perfis de build em `eas.json` ja definem a URL da Render como `EXPO_PUBLIC_API_URL`. A instancia gratuita pode levar cerca de **30 a 60 segundos** para responder a primeira chamada depois de ficar inativa.

Essa variavel e incorporada ao app cliente; nao coloque segredos nela.

## 5. Como rodar

Na pasta `mobile/`:

```sh
npm install
npx expo start
```

Escaneie o QR code com Expo Go ou use um emulador com o terminal do Expo aberto:

- `a`: abrir no emulador Android.
- `i`: abrir no simulador iOS (macOS/Xcode).
- `npx expo start -c`: limpar o cache do Metro e iniciar novamente.
- `npm run web` ou `npx expo start --web`: iniciar a versao web.

O app usa `expo-notifications` para notificacoes locais. **Notificacoes remotas/push nao estao implementadas** e nao funcionam no Expo Go. Um development build ou APK permite testar capacidades nativas, mas nao adiciona o fluxo de push que ainda nao existe no app e no backend.

## 6. Contas de teste

O seed do backend cria estas contas:

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor1.teste@soscidade.com` | `Teste@123` |
| Gestor | `gestor2.teste@soscidade.com` | `Teste@123` |

Para criar as contas em um ambiente de desenvolvimento local, execute no backend:

```sh
npx prisma db seed
```

O seed faz upsert dos dois gestores. **Use somente em desenvolvimento local; nunca execute para popular contas de teste em producao.** O seed nao cria uma conta de denunciante: crie uma pela tela de cadastro do app.

## 7. Estrutura de pastas e arquitetura

Estrutura ativa de rotas e codigo do app:

```text
mobile/
|-- app/                         # Expo Router: layouts e arquivos de rota
|   |-- _layout.tsx
|   |-- (public)/                # index, login, register
|   |-- (denunciante)/           # home, nova-denuncia, minhas-denuncias, detalhe-denuncia
|   `-- (gestor)/                # denuncias, dashboard, mapa, gestores
|-- App.tsx                      # arquivo presente; nao e o entrypoint declarado
|-- index.ts                     # polyfills web e expo-router/entry
`-- src/
    |-- components/
    |   |-- ui/
    |   |-- feedback/
    |   |-- denuncia/
    |   `-- gestor/
    |-- constants/               # configuracao, bairros, tipos, situacoes, tema
    |-- hooks/                   # formularios, cadastro, gestores, guards, notificacoes
    |-- models/                  # aliases/reexports de tipos
    |-- navigation/              # navegador React Navigation legado
    |-- screens/routes/          # componentes de tela usados pelos arquivos de rota
    |   |-- public/
    |   |-- denunciante/
    |   `-- gestor/
    |-- services/                # servicos de dominio e http.ts
    |-- store/                   # stores Zustand
    |-- types/
    |-- utils/
    `-- viewmodels/              # ViewModels do fluxo legado
```

Os arquivos em `app/` compoem layouts e encaminham para as telas em `src/screens/routes/`. No fluxo ativo, as telas combinam componentes e hooks; os hooks podem coordenar stores e servicos; as stores tambem chamam servicos; os servicos usam `src/services/http.ts` para fazer `fetch` na API. Nem todo fluxo atravessa todas as camadas: por exemplo, o cadastro usa o hook `useCadastroUsuario` e o servico de usuarios diretamente.

O ponto de entrada declarado em `package.json` e `index.ts`, que carrega `expo-router/entry`. Alem da estrutura ativa acima, ainda existem arquivos da organizacao anterior em `src/models/`, `src/navigation/`, `src/viewmodels/`, `src/screens/LoginScreen.tsx`, `src/screens/NovaDenunciaScreen.tsx` e `App.tsx`. Eles nao sao descritos como parte do fluxo atual do Expo Router; sua remocao ou migracao ainda precisa ser avaliada.

Fluxo de criar denuncia:

```text
app/(denunciante)/nova-denuncia.tsx
  -> src/screens/routes/denunciante/NovaDenunciaScreen.tsx
    -> useDenunciaForm
      -> useDenunciasStore.createDenuncia
        -> denunciasAPI.create
          -> apiRequest (services/http.ts)
            -> POST /denuncias
```

Fluxo de login:

```text
app/(public)/login.tsx
  -> src/screens/routes/public/LoginScreen.tsx
    -> useAuthStore.login
      -> authAPI.login
        -> apiRequest (services/http.ts)
          -> POST /auth/login
        -> SecureStore: token e perfil
        -> persistencia Zustand/AsyncStorage: user e isAuthenticated
```

## 8. Mapa de rotas

| Rota | Grupo | Perfil que acessa | Funcao |
|---|---|---|---|
| `/` | `(public)` | Visitante nao autenticado | Apresentacao do app e acesso a login/cadastro |
| `/login` | `(public)` | Visitante nao autenticado | Autenticacao e encaminhamento pelo perfil retornado |
| `/register` | `(public)` | Visitante nao autenticado | Cadastro de cidadao |
| `/home` | `(denunciante)` | `DENUNCIANTE` | Resumo e ultimas denuncias do cidadao |
| `/nova-denuncia` | `(denunciante)` | `DENUNCIANTE` | Formulario, fotos e selecao de bairro/localizacao |
| `/minhas-denuncias` | `(denunciante)` | `DENUNCIANTE` | Busca, filtro e lista de denuncias do cidadao |
| `/detalhe-denuncia?id=...` | `(denunciante)` | `DENUNCIANTE` | Detalhes da denuncia selecionada |
| `/denuncias` | `(gestor)` | `GESTOR` | Lista, filtros, busca e atualizacao de status; aba inicial do grupo |
| `/dashboard` | `(gestor)` | `GESTOR` | Indicadores e distribuicao das denuncias |
| `/mapa` | `(gestor)` | `GESTOR` | Mapa nativo e filtro por tipo; na web, lista de ocorrencias agrupadas por bairro |
| `/gestores` | `(gestor)` | `GESTOR` | Lista, cadastro pela interface e remocao de gestores |

Os grupos usam `useRoleGuard`: visitante em area protegida vai para `/login`; gestor fora da area de gestor vai para `/denuncias`; denunciante que tenta acessar a area de gestor vai para `/home`. O grupo publico encaminha usuarios ja autenticados para a area correspondente.

## 9. Autenticacao e seguranca no app

- No login nativo, `useAuthStore` grava o token em `expo-secure-store` na chave `authToken` e o perfil na chave `userRole`. O helper legado `src/services/tokenStorage.ts` usa a chave `sos_cidade_auth_token`; ele pertence ao fluxo antigo baseado em `AuthService`/ViewModels.
- O cliente HTTP le `authToken` e envia `Authorization: Bearer <token>` quando a requisicao autenticada tem token.
- O persist middleware do Zustand usa AsyncStorage com a chave `auth-storage`. O `partialize` grava somente `user` e `isAuthenticated`; `isLoading` nao e persistido. O estado serializado pelo middleware inclui esses campos dentro do envelope de persistencia do Zustand. Senha e token nao fazem parte desse estado.
- No web, `index.ts` substitui as funcoes de `expo-secure-store` por acesso a `window.localStorage`; portanto, nesse ambiente o token nao fica em armazenamento nativo criptografado.
- `useRoleGuard` controla a navegacao e melhora a experiencia, mas nao e uma barreira de seguranca. A autorizacao real deve ser aplicada pelo servidor, que valida o token e o perfil nas rotas protegidas.

## 10. Contrato com a API

Os endpoints sao relativos a `EXPO_PUBLIC_API_URL` e, no backend atual, nao usam prefixo `/api`.

| Tela/acao | Endpoint | Metodo | Perfil permitido no backend |
|---|---|---:|---|
| Entrar | `/auth/login` | POST | Sem autenticacao |
| Sair | `/auth/logout` | POST | Rota sem middleware de autenticacao |
| Cadastro de cidadao | `/users` | POST | Sem autenticacao; o backend cria sempre `DENUNCIANTE` |
| Criar gestor pela tela de gestores | `/users` | POST | A rota nao exige perfil; atualmente o backend ignora o papel enviado e cria `DENUNCIANTE` |
| Listar gestores | `/users?role=GESTOR` | GET | `GESTOR` (o helper tambem pode chamar `/users` sem `role`; ambas as rotas exigem `GESTOR`) |
| Remover gestor | `/users/:id` | DELETE | `GESTOR` |
| Listar denuncias para gestor | `/denuncias?_page=...&_limit=...&_meta=1` | GET | `GESTOR` |
| Listar denuncias do usuario autenticado | `/denuncias/minhas?_page=...&_limit=...` | GET | Qualquer usuario autenticado; o backend filtra pelo usuario do token |
| Consultar denuncia por id | `/denuncias/:id` | GET | Qualquer usuario autenticado; o helper existe, mas a tela de detalhes ativa procura a denuncia na store |
| Criar denuncia | `/denuncias` | POST | Qualquer usuario autenticado |
| Alterar situacao | `/denuncias/:id` | PATCH | `GESTOR` |
| Excluir denuncia | `/denuncias/:id` | DELETE | `GESTOR`; a store expoe a operacao, sem chamada por tela ativa encontrada |

Listagem de denuncias aceita parametros de paginacao e filtros de tipo, bairro e situacao. O backend monta `req.user` a partir do token nas rotas de denuncias. A tabela descreve as verificacoes das rotas atuais do backend, nao apenas os guards do cliente.

## 11. Permissoes do app

| Recurso | Configuracao e uso encontrado |
|---|---|
| Camera | `expo-image-picker` pede permissao ao escolher camera e chama `launchCameraAsync`; `app.json` declara `CAMERA` no Android e os plugins configuram os textos de permissao. |
| Galeria/fotos | `expo-image-picker` pede permissao da biblioteca e chama `launchImageLibraryAsync`; o plugin configura a mensagem de acesso a fotos. As imagens sao anexadas a denuncias. |
| Localizacao | `expo-location` pede permissao em primeiro plano, obtem coordenadas e faz geocodificacao reversa para preencher o bairro. Android declara coarse/fine location. O plugin tambem configura o texto de acesso “always and when in use”; nao foi encontrado uso de localizacao em segundo plano. |
| Notificacoes | `expo-notifications` e configurado como plugin e a aplicacao pede permissao em runtime ao iniciar; Android recebe o canal “Atualizações de denúncias”. |
| Audio | `app.json` declara `android.permission.RECORD_AUDIO`, mas nao foi encontrado uso de gravacao de audio em `app/` ou `src/`. Ver Pendencias. |

O plugin `expo-camera` esta configurado, mas a implementacao de captura encontrada usa `expo-image-picker`; nao foi encontrada chamada direta a API de `expo-camera`.

## 12. Notificacoes

O app implementa **notificacoes locais**, nao push remoto:

- Ao iniciar o app nativo, `useRegistroNotificacoes` pede permissao. No Android, cria o canal “Atualizações de denúncias”.
- Ao atualizar a situacao pela store, o dispositivo que executou a alteracao pode agendar uma notificacao local imediata.
- Ao recarregar denuncias, se o estado anterior ja estava carregado e uma denuncia do usuario autenticado mudou, o app pode avisar esse denunciante localmente.
- A notificacao mostra o tipo, protocolo e nova situacao. No web, os helpers de notificacao retornam sem agendar.

Nao foi encontrado registro de Expo Push Token, envio push no backend ou endpoint de notificacao. Portanto, notificacoes remotas nao estao implementadas nem passam a funcionar apenas por gerar um development build/APK.

## 13. Build com EAS

O projeto EAS configurado em `app.json` tem o ID `114df36c-08b7-4bc9-8bc1-f954ef5f52c4`.

| Perfil em `eas.json` | Configuracao Android |
|---|---|
| `development` | Development client, distribuicao interna, APK |
| `preview` | Distribuicao interna, APK |
| `production` | App Bundle (`.aab`) |

Os tres perfis definem `EXPO_PUBLIC_API_URL` para a API hospedada. Com EAS CLI disponivel:

```sh
eas login
eas build -p android --profile preview
```

O APK interno fica disponivel no link da build mostrado pelo EAS CLI e na pagina de builds do projeto EAS. O perfil `development` tambem gera APK para instalar o development client; `production` gera `.aab`, nao APK.

OTA esta desativado (`updates.enabled: false` em `app.json`). Cache offline de denuncias/requisicoes nao foi encontrado; as operacoes de API precisam de conexao.

## 14. Qualidade e testes

Na pasta `mobile/`:

```sh
npx tsc --noEmit
npx expo-doctor
```

Os testes existentes no repositorio estao em:

- [`../tests/`](../tests/): testes de API e contratos.
- [`../backend/tests/`](../backend/tests/): testes unitarios do backend.
- [`../e2e/`](../e2e/): testes end-to-end com Playwright.
- [`testes/`](./testes/): backlog e estrategia de testes mobile; nao sao uma suite de testes executavel.
- [`../.github/workflows/`](../.github/workflows/): automacoes CI, incluindo [`unit-api.yml`](../.github/workflows/unit-api.yml), [`regressao-completa.yml`](../.github/workflows/regressao-completa.yml) e [`e2e-smoke.yml`](../.github/workflows/e2e-smoke.yml).

Esses caminhos apontam para testes do repositorio; nao implicam que exista uma suite de testes mobile dedicada.

## 15. Problemas comuns

- **Tela branca ou `Network request failed`:** confira `EXPO_PUBLIC_API_URL`, se a API esta acessivel e se o dispositivo pode acessar o host. Em celular fisico, substitua `localhost` pelo IP da maquina na rede ou use a URL da Render.
- **Primeira chamada lenta:** o backend gratuito da Render pode estar iniciando; aguarde de 30 a 60 segundos e tente novamente.
- **Bundle desatualizado ou erro de modulo no Metro:** pare o servidor e rode `npx expo start -c`.
- **Diff muito grande sem muitas alteracoes:** confira se a diferenca e apenas de CRLF/LF antes de normalizar arquivos; evite converter a arvore inteira sem necessidade.
- **Permissao negada no emulador:** permita camera, fotos, localizacao ou notificacoes nas configuracoes do app/dispositivo e tente novamente. A localizacao e solicitada quando o usuario aciona o botao de localizacao.

## 16. Pendencias conhecidas

- A tela de gestores envia `role: 'GESTOR'` ao criar usuario, mas `backend/src/services/user.service.ts` grava `DENUNCIANTE` fixo. A criacao de gestores pela interface precisa de um contrato/backend que realmente crie gestor com autorizacao adequada.
- `RECORD_AUDIO` esta declarado no Android sem uso de gravacao encontrado. A permissao “always” de localizacao tambem esta descrita no plugin, enquanto o codigo pede somente localizacao em primeiro plano; revisar se ambas as declaracoes sao necessarias.
- Push remoto nao esta implementado. Notificacoes atuais sao locais.
- Cache offline nao esta implementado e OTA esta desativado.
- Permanecem arquivos da arquitetura anterior (`src/models`, `src/navigation`, `src/viewmodels`, telas antigas em `src/screens/` e `App.tsx`) ao lado do fluxo Expo Router. Ainda precisa ser decidido se devem ser migrados ou removidos.
- Existe tambem uma pasta aninhada `mobile/mobile/` com outra arvore de app e codigo. Ela nao e o diretorio apontado pelo `package.json` deste projeto e precisa ser identificada como copia legada ou removida.
- O helper de `GET /denuncias/:id` esta protegido por autenticacao, mas nao foi encontrada verificacao de propriedade da denuncia nesse controlador. O backend deve definir e aplicar a regra de acesso por id.
- `expo-doctor` reportou peer dependencies ausentes (`expo-font` e `@shopify/react-native-skia`) e diferencas de versao de pacotes; a verificacao do schema do Expo falhou por falta de conexao na ultima execucao.
- A pasta `.expo/` nao esta ignorada pelo `.gitignore`, segundo `expo-doctor`.
- `knip` ainda nao produziu uma analise de arquivos/exports nao usados; a execucao terminou por falta de memoria.
