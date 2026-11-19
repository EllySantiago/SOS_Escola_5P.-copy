# Backlog de testes do app mobile (S.O.S Cidade)

Situação de partida: o app (`mobile/`, Expo SDK 56 + React Native) **não tinha nenhum teste automatizado**. Este backlog organiza o que testar, em que ordem e com qual ferramenta.

**Legenda.** Tipo: **Smoke** (fluxo crítico, roda no PR), **E2E** (fluxo completo), **Unit** (função isolada), **Seg** (segurança). Status: ✅ escrito, 🔲 a fazer. Prioridade segue a política (`docs/tas.md`, seção 1.4).

## Decisões de ferramenta

| Camada | Ferramenta | Por quê |
|---|---|---|
| E2E e smoke | **Maestro** | Fluxo em YAML, sem escrever código. Os fluxos usam os `accessibilityLabel` que as telas já têm. Roda no emulador Android e, mais tarde, no iOS |
| Unitários | Jest + `jest-expo` | Padrão do Expo. Testa regras de validação e stores sem emulador |

**Maestro é difícil?** O fluxo em si é a parte fácil: cada passo é uma linha (`tapOn`, `inputText`, `assertVisible`). A parte trabalhosa é o **ambiente**: o emulador no CI, o build do app e o app falando com o backend. Isso já está montado em `mobile/scripts/` e no workflow `mobile-e2e`, mas **ainda não foi executado**. Os ajustes da primeira execução real são o principal risco do item M-00.

## Fase 0: infraestrutura

| ID | Item | Tipo | Prioridade | Status |
|---|---|---|---|---|
| M-00 | Primeira execução real do workflow `mobile-e2e` e ajuste de tempos e seletores | E2E | Alta | 🔲 |
| M-01 | Fluxos Maestro com tags `smoke`, `e2e` e `flaky` e script com nova tentativa e quarentena | E2E | Alta | ✅ |
| M-02 | Subflows reutilizáveis (abrir app, cadastrar e logar, logar gestor, criar denúncia) | E2E | Alta | ✅ |
| M-03 | Workflow `mobile-e2e` (emulador Android, backend local, Metro) | E2E | Alta | ✅ (não validado) |
| M-04 | Tornar `mobile-e2e` check obrigatório da `main` depois de 10 execuções verdes seguidas | E2E | Média | 🔲 |
| M-05 | Configurar Jest com `jest-expo` e script `npm test` no `mobile/` | Unit | Alta | 🔲 |

## Fase 1: smoke (3 fluxos, roda em PR que mexe em `mobile/`)

| ID | Fluxo | Arquivo | Status |
|---|---|---|---|
| MS-01 | Gestor faz login e vê o painel | `smoke-01-login-gestor.yaml` | ✅ |
| MS-02 | Denunciante se cadastra, registra uma denúncia e vê o protocolo | `smoke-02-denunciante-registra-denuncia.yaml` | ✅ |
| MS-03 | Denunciante comum não vê as telas do gestor | `smoke-03-denunciante-sem-acesso-gestor.yaml` | ✅ |

## Fase 2: E2E

| ID | Fluxo | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| ME-01 | Login: validação dos campos | `e2e-01-login-validacoes.yaml` | Média | ✅ |
| ME-02 | Login: senha errada não entra | `e2e-02-login-credenciais-invalidas.yaml` | Alta | ✅ |
| ME-03 | Cadastro: validações e senhas diferentes | `e2e-03-cadastro-validacoes.yaml` | Média | ✅ |
| ME-04 | Nova denúncia exige tipo e bairro | `e2e-04-nova-denuncia-validacoes.yaml` | Média | ✅ |
| ME-05 | Denúncia registrada aparece em Minhas Denúncias | `e2e-05-minhas-denuncias.yaml` | Alta | ✅ |
| ME-06 | Logout volta para a tela inicial | `e2e-06-logout.yaml` | Média | ✅ |
| ME-07 | Gestor navega entre as abas | `e2e-07-gestor-navega-abas.yaml` | Média | ✅ |
| ME-08 | Busca em Minhas Denúncias filtra por tipo e bairro | `e2e-08-minhas-denuncias-busca.yaml` | Baixa | ✅ |
| ME-09 | Detalhe da denúncia mostra os dados enviados | | Média | 🔲 |
| ME-10 | Gestor busca a denúncia pelo protocolo e abre o detalhe | `e2e-09-gestor-busca.yaml` | Média | ✅ |
| ME-11 | Gestor cria outro gestor (ver MI-07: hoje falha, defeito no backend) | `int-07-gestor-cria-gestor.yaml` | Média | ✅ (falha conhecida) |
| ME-12 | Dashboard do gestor abre e mostra o total (verificação superficial, sem conferir números) | `e2e-10-dashboard-gestor.yaml` | Baixa | ✅ (parcial) |
| ME-13 | Mapa do gestor abre (depende de chave de mapas e de GPS: candidato a `flaky`) | | Baixa | 🔲 |
| ME-14 | Anexar imagem à denúncia (limite de 4) | | Baixa | 🔲 |
| ME-15 | Permissões de câmera, galeria e localização: negar e conceder | | Média | 🔲 |
| ME-16 | Sessão persiste ao fechar e reabrir o app (hoje não persiste: o README do mobile lista como pendência) | | Média | 🔲 |
| ME-17 | Sem internet: o app mostra erro claro (também pendência do README) | | Média | 🔲 |

## Fase 3: unitários (Jest)

| ID | O que testar | Onde | Prioridade | Status |
|---|---|---|---|---|
| MU-01 | Validação de login (e-mail e senha) | `app/(public)/login.tsx` (extrair a função) | Média | 🔲 |
| MU-02 | Validação de cadastro (nome, e-mail, senha, confirmação) | `app/(public)/register.tsx` | Média | 🔲 |
| MU-03 | `apiCall`: envia o header `Authorization`, trata erro e resposta vazia | `src/lib/api.ts` | Alta | 🔲 |
| MU-04 | `useAuthStore`: login guarda o token, logout apaga | `src/store/useAuthStore.ts` | Alta | 🔲 |
| MU-05 | `useDenunciasStore`: criar, listar, filtrar | `src/store/useDenunciasStore.ts` | Média | 🔲 |

## Fase 4: segurança do app

| ID | Verificação | Tipo | Prioridade | Status |
|---|---|---|---|---|
| MX-01 | Denunciante comum não vê as telas do gestor | Seg / Smoke | Alta | ✅ (MS-03) |
| MX-02 | O token fica no `expo-secure-store`, nunca em `AsyncStorage` | Seg / Unit | Alta | 🔲 |
| MX-03 | Logout apaga o token do armazenamento seguro | Seg / Unit | Alta | 🔲 |
| MX-04 | A API rejeita token adulterado (feito em MI-05). Falta: expirado, e o app voltar ao login | Seg / E2E | Alta | ✅ parcial |
| MX-05 | O app em produção só fala HTTPS (as URLs do `eas.json` são HTTPS; conferir que não sobra `http://` no código) | Seg | Média | 🔲 |
| MX-06 | Nenhuma senha ou token aparece em log do app | Seg | Média | 🔲 |
| MX-07 | Rota do gestor acessada direto por link profundo (`soscidade://`) por denunciante é bloqueada | Seg / E2E | Alta | 🔲 |

## Fase 5: integração app + backend

Fluxos tag `integracao`. O Maestro chama a API direto (`.maestro/scripts/api.js`) para preparar dados e para conferir o que o app gravou. Isso testa o app e o backend juntos, em duas direções: app para backend e backend para app.

| ID | O que verifica | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| MI-01 | Denúncia criada no app chega ao backend com tipo, bairro, situação e protocolo, e o protocolo do app é o da API | `int-01-app-cria-denuncia-backend-recebe.yaml` | Alta | ✅ |
| MI-02 | Denúncia criada pela API aparece no app, com protocolo, bairro e descrição (descriptografada) no detalhe | `int-02-backend-cria-app-mostra.yaml` | Alta | ✅ |
| MI-03 | Gestor marca "Resolvido" no app e o backend grava | `int-03-gestor-altera-status-backend-confirma.yaml` | Alta | ✅ |
| MI-04 | Status alterado pela API aparece para o denunciante no app | `int-04-backend-resolve-app-mostra.yaml` | Média | ✅ |
| MI-05 | Conta criada no app é DENUNCIANTE e recebe 403 nas rotas de gestor, 401 sem token ou com token adulterado | `int-05-seguranca-permissoes-da-api.yaml` | Alta | ✅ |
| MI-06 | Denunciante não lê a denúncia de outra pessoa (`GET /denuncias/:id`) | `int-06-seguranca-denunciante-nao-le-denuncia-alheia.yaml` | Alta | ✅ (falha esperada, ver abaixo) |
| MI-07 | Gestor criado pelo app entra de fato com perfil GESTOR | `int-07-gestor-cria-gestor.yaml` | Alta | ✅ (falha esperada, ver abaixo) |
| MI-08 | Denúncia anônima: nome fica "Anônimo" no backend | | Média | 🔲 |
| MI-09 | Envio de imagem: o backend recebe e devolve até 4 imagens | | Baixa | 🔲 |
| MI-10 | Backend fora do ar: o app mostra erro e não trava (liga com ME-17) | | Média | 🔲 |
| MI-11 | Exclusão de gestor no app remove o usuário no backend | | Média | 🔲 |

### Dois testes que devem falhar hoje (achados pela leitura do código)

Estes testes não foram executados. A previsão de falha vem de ler o código do backend:

- **MI-07:** `backend/src/services/user.service.ts` grava `role: 'DENUNCIANTE'` fixo em todo cadastro. O app envia `role: 'GESTOR'` ao "Adicionar gestor", mostra "Gestor criado!", mas a conta nasce como denunciante e não aparece na lista de gestores. Defeito no backend (`falha:sut`).
- **MI-06:** `GET /denuncias/:id` (`denuncia.controller.ts`) não confere de quem é a denúncia. Qualquer usuário logado pode ler a de outro, com nome e descrição já descriptografados. Falha de controle de acesso (`falha:sut`, de interesse direto da segurança).

Se a execução confirmar, a política manda tratá-los como `falha:sut`: abrir issue pelo formulário, **não** pôr em quarentena nem apagar o teste. Se a equipe decidir que algum comportamento é intencional, a decisão vira `falha:esperada` e o teste muda no mesmo pull request.

## Cobertura atual

| Área do app | Cobertura | Observação |
|---|---|---|
| Login, cadastro e logout | Boa | Caminho feliz, validações e senha errada |
| Registro de denúncia (tipo, bairro, descrição) | Boa | App e backend conferidos |
| Minhas denúncias, detalhe, busca | Média | Falta o filtro por situação |
| Painel do gestor (lista, busca, status) | Média | Falta o filtro por tipo e bairro |
| Dashboard | Fraca | Só abre e mostra "Total", sem conferir números |
| Mapa | Nenhuma | Depende de chave de mapas e de GPS |
| Gestores (criar e remover) | Parcial | Criar tem teste (que deve falhar), remover não |
| Imagens, câmera, localização, permissões | Nenhuma | Exigem permissão do sistema no emulador |
| Notificações | Nenhuma | Disparam na mudança de status |
| Sessão ao reabrir o app e modo offline | Nenhuma | O README do mobile lista como pendência |
| Controle de acesso (API) | Média | Rotas de gestor e token, mais dois testes para as falhas acima |
| Unitários (Jest) | Nenhuma | Só no backlog |

## Pendências e riscos conhecidos

- **Seletores por texto.** Os fluxos usam os rótulos de acessibilidade (`accessibilityLabel`). Se alguém trocar um rótulo, o fluxo quebra: é `falha:esperada` ou `falha:tas` (ver `docs/tas-mobile.md`). Item de melhoria: acrescentar `testID` nos elementos críticos.
- **Só Android.** O iOS exige Mac e não está no CI. Fica para depois do M-04.
- **Os fluxos não foram executados.** Foram escritos a partir das telas e dos textos do código.
- **Dados.** Os fluxos criam usuários com e-mail único (`maestro.<hora>@sos.com`) e não apagam nada. Em banco descartável do CI isso não importa. Contra um banco compartilhado, vão acumular lixo.
