# TAS do app mobile (S.O.S Cidade)

Complemento do `docs/tas.md` para o app mobile (`mobile/`, Expo + React Native). O que vale para toda a equipe (as 4 classificações, as prioridades, os prazos, as labels e o formulário de manutenção) continua em `docs/tas.md`. Aqui está só o que muda no mobile. A lista de testes está em `docs/backlog-testes-mobile.md`.

## 0. Estado e ferramenta

- **Estado:** o app não tinha nenhum teste. Há agora 3 fluxos smoke, 10 fluxos E2E e 7 fluxos de integração app + backend em `mobile/.maestro/` (20 no total). A cobertura por área está em `docs/backlog-testes-mobile.md`.
- **Ferramenta: Maestro.** Cada fluxo é um YAML de poucas linhas, legível por quem não programa. Usa os `accessibilityLabel` que as telas já têm, então não foi preciso alterar o código do app. Alternativas descartadas: Detox (exige código e configuração nativa pesada) e Appium (mais flexível, mas muito mais caro de manter para uma equipe de estudantes).
- **Onde roda:** num emulador Android, no workflow `mobile-e2e`, contra o backend local do job.
- **Honestidade sobre o estado:** os fluxos foram escritos a partir das telas e **ainda não foram executados num emulador**. A primeira execução real (item M-00 do backlog) deve gerar ajustes de seletor e de tempo. Enquanto isso não acontece, o `mobile-e2e` **não é check obrigatório**.

## 1. Política de manutenção (mobile)

### 1.1 Tratamento de falhas

O processo é o da seção 1.2 do `tas.md`: ler a evidência, rodar de novo uma vez, reproduzir, comparar com a última execução verde e classificar. Para o mobile, a evidência está no artefato `resultados-testes-mobile`: XML dos fluxos, log do backend, log do Metro e a pasta de execuções do Maestro (com capturas de tela). Reproduzir localmente é `npm run test:mobile:smoke` com um emulador aberto.

### 1.2 Classificação: como reconhecer cada tipo no mobile

| Tipo | Sinais no mobile | Exemplo |
|---|---|---|
| `falha:sut` | O app ou a API se comporta errado testando à mão | Registrar denúncia válida não mostra o protocolo; denunciante vê aba do gestor |
| `falha:tas` | O app funciona à mão, mas o fluxo não acha o elemento ou o texto | O fluxo procura "Enviar denúncia" e o rótulo mudou; esperar curto demais |
| `falha:ambiente` | Falha antes do teste: emulador não sobe, APK não compila, Metro não responde, backend fora do ar | "adb: device offline"; estouro de tempo ao subir o emulador |
| `falha:esperada` | A tela mudou de propósito e o fluxo ainda cobre a versão antiga | Botão renomeado por decisão de design |

**Regra da dúvida:** a mesma do `tas.md`. Em dúvida entre app e fluxo, trata como `falha:sut`.

**Atenção especial no mobile:** emulador lento causa falha de tempo parecida com defeito. Por isso a primeira resposta a uma falha de "elemento não encontrado" é rodar de novo uma vez e olhar a captura de tela do Maestro antes de classificar.

### 1.3 Prioridades, prazos e responsáveis

Valem as regras do `tas.md` (seções 1.4 e 1.5). Aplicação ao mobile:

- **Alta (1 dia útil):** smoke mobile vermelho que não vem da mudança do PR, ou `falha:sut` nos fluxos de login e de registro de denúncia. **Hoje o `mobile-e2e` não é check obrigatório, então o smoke vermelho não bloqueia merge.** A prioridade alta continua valendo pela mesma razão: o fluxo crítico do produto está quebrado.
- **Média (3 dias úteis):** falha só no E2E completo noturno, fora dos fluxos críticos.
- **Baixa:** lentidão, fluxo duplicado, fluxo sem rastreabilidade (revisão periódica).
- **Responsáveis:** os mesmos da seção 1.5 do `tas.md`. A pessoa responsável pelos testes de cada suíte deve ser definida pela equipe de mobile (campo a preencher no formulário).

## 2. Gestão dos testes (mobile)

### 2.1 Testes instáveis

Valem os princípios da seção 2.1 do `tas.md`: uma única nova tentativa, o resultado verde da nova tentativa é sempre registrado, quarentena é provisória (no máximo 10 dias úteis) e defeito real nunca vai para quarentena.

**Causas prováveis no mobile** (para investigar antes de pôr em quarentena): animação ou tela ainda carregando, backend lento (o `render.yaml` indica hospedagem gratuita, que "dorme"), permissões do sistema (câmera, localização), mapa, notificações e teclado na frente do botão.

### 2.2 Automação

| Peça | Onde | Como funciona |
|---|---|---|
| Tags | Cabeçalho do fluxo: `tags: [smoke]`, `[e2e]`, `[integracao]` ou `[flaky]` | Decide em qual suíte o fluxo roda |
| Quarentena | `mobile/scripts/rodar-maestro.sh quarentena` | Roda só os fluxos `flaky`, à parte. O script nunca devolve falha e o `ci-mobile.sh` ignora o resultado, então **não bloqueia** |
| Nova tentativa | `rodar-maestro.sh`, com `CI=true` | O fluxo que falha roda mais **uma** vez |
| Registro do instável | `resultados/flaky-mobile.json` e action `registrar-flaky` | Quando o fluxo passa na nova tentativa, vira issue com a label `flaky` (mesmo mecanismo do E2E web) |

**Como pôr um fluxo em quarentena:** troque a tag para `tags: [flaky]` no cabeçalho do YAML (ele deixa de rodar no smoke e no E2E) e documente na issue.
**Como tirar:** corrija a causa, volte a tag original e confirme com 5 execuções verdes seguidas.

O Maestro não tem nova tentativa nativa. Por isso ela está no script, que roda cada fluxo individualmente. Isso também dá um XML por fluxo (`resultados/mobile-<fluxo>.xml`), que entra na issue de falha automática.

### 2.3 Revisão periódica

Junto com a revisão da seção 2.3 do `tas.md`, a cada 2 semanas. Critérios aplicados ao mobile:

| Critério | Sinal de alerta |
|---|---|
| Instabilidade | 2 ou mais registros `flaky` do mesmo fluxo em 14 dias, ou mais de 10 dias úteis em quarentena |
| Tempo | Fluxo acima de 90 s, ou smoke inteiro acima de 8 minutos (sem contar o build) |
| Duplicação | Mesmos passos de login ou cadastro repetidos no YAML em vez de usar os subflows de `.maestro/subflows/` |
| Rastreabilidade | Fluxo sem item correspondente no `docs/backlog-testes-mobile.md` |

Os limites de tempo são **estimativas**: devem ser reajustados depois da primeira medição real.

### 2.4 Remoção de fluxos

Mesmos critérios, decisão e registro de riscos da seção 2.4 do `tas.md`. No mobile, a remoção de fluxo de segurança (MX-*) exige que a pessoa da equipe de segurança do projeto participe da decisão.

## 3. GitHub e CI (mobile)

### 3.1 Labels e formulário

- A label `mobile` foi acrescentada às do `tas.md`. O formulário de manutenção tem o campo **Suíte afetada** e a action `rotular-manutencao` aplica `mobile` sozinha quando se escolhe "Mobile".
- `falha:*`, `prioridade:*` e `flaky` são as mesmas de toda a equipe.
- O workflow `criar-labels` cria a `mobile` junto com as outras.

### 3.2 Workflow `mobile-e2e`

| Gatilho | Suíte | Observação |
|---|---|---|
| Pull request que altera `mobile/` | smoke | Não obrigatório |
| Todo dia às 03:30 (Brasília) | E2E completo, integração app + backend e quarentena | Abre issue `falha-pipeline` se falhar |
| Manual ("Run workflow") | smoke, E2E ou integração, à escolha | |

**Por que não é obrigatório ainda:** emulador no runner é lento e a suíte nunca rodou de verdade. Tornar obrigatório antes disso travaria os pull requests de toda a equipe por causa de um teste não calibrado. Critério para virar obrigatório: 10 execuções verdes seguidas do smoke (item M-04).

**Passos do job:** sobe o backend com `subir-stack` (migrations e seed do gestor), gera o APK de desenvolvimento, instala o Maestro, abre o emulador Android, liga o Metro e roda `rodar-maestro.sh`. O app fala com o backend por `adb reverse` em `localhost:8000`.

### 3.3 Issue automática de falha

O mobile reutiliza as actions `abrir-issue-falha` (falha do workflow vira issue `falha-pipeline` com os fluxos que falharam, lidos do XML) e `registrar-flaky`. Em pull request, a issue automática de falha não é aberta (a falha já aparece no PR).

### 3.4 Integração app + backend

Os fluxos `int-*` usam o Maestro para chamar a API (`mobile/.maestro/scripts/api.js`). Em uma direção, o app cria o dado e a API confirma o que foi gravado. Na outra, a API cria o dado e o app mostra. Quando falham, a classificação precisa decidir **de que lado** está o problema:

- o app mostra algo errado, mas a resposta da API está certa: `falha:sut` (app);
- a resposta da API está errada: `falha:sut` (backend), e vale abrir também o bug para o backend;
- o fluxo montou a chamada errada (caminho, corpo, token): `falha:tas`.

Dois fluxos (`int-06` e `int-07`) devem falhar hoje por defeitos do backend, apontados no backlog (seção "Dois testes que devem falhar hoje"). Eles não são instáveis nem devem ir para quarentena.

## 4. Roteiro da demonstração (mobile)

**Caso proposto (a equipe confirma antes do ensaio):** o rótulo do botão "Enviar denúncia" muda numa tela de nova denúncia, o smoke `smoke-02` falha por não achar o botão e o caso é `falha:esperada` (ou `falha:tas`, se o rótulo mudou sem decisão), `prioridade:alta`.

| Etapa | O que mostrar |
|---|---|
| 1. Identificação | Execução do `mobile-e2e` vermelha. Abrir o artefato `resultados-testes-mobile` e a captura de tela do Maestro no passo que falhou |
| 2. Investigação | Rodar de novo uma vez. Abrir o app no emulador: o botão existe, com outro texto. Comparar com a última execução verde: o diff mostra o rótulo trocado |
| 3. Issue | Formulário de manutenção: Suíte = Mobile, tipo `esperada`, prioridade alta, responsável e prazo |
| 4. Labels | Mostrar `falha:esperada`, `prioridade:alta` e `mobile` aplicadas sozinhas |
| 5. Correção | Pull request que atualiza o rótulo nos subflows (`criar-denuncia.yaml`) |
| 6. Fechamento | `mobile-e2e` verde, issue fechada com o link do pull request |

**Alternativa com `falha:sut` real:** se a execução confirmar a previsão, o fluxo `int-07-gestor-cria-gestor` serve de demonstração do caminho completo para defeito no sistema: a falha aparece no `mobile-e2e`, a investigação (ler `user.service.ts`) mostra a causa, a issue recebe `falha:sut`, `prioridade:alta` e `mobile`, o backend é corrigido e o fluxo passa a ficar verde.

**Extra (quarentena):** trocar a tag de um fluxo para `[flaky]`, mostrar que ele sai do smoke e roda só na quarentena, sem bloquear.

## 5. Limites desta entrega

- Os fluxos e o workflow não foram executados num emulador.
- Só Android. iOS fica fora do CI.
- Os testes unitários (Jest) estão no backlog e não foram criados.
- O uso de `http.get`/`http.post` e de `env` com valores JSON dentro dos scripts do Maestro segue o que conheço da ferramenta, mas não foi executado. Se algum fluxo `int-*` falhar logo na chamada à API, confira primeiro a versão do Maestro.
- Não há varredura automática de dependências ou análise estática de segurança no mobile.
