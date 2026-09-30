# Plano de Testes e Backlog de Automação

*Do escopo ao backlog priorizado, em seis decisões encadeadas.*

| Campo | Conteúdo |
| --- | --- |
| **Equipe / Squad** | Equipe 8 |
| **Produto / SUT** | SOS Cidade |
| **Integrantes** | João Pedro do Monte Souza; Pedro Henrique Rennil da Silva Souza; Gabriel Cavalcante Barros de Oliveira; Alan Vitor Ferreira Sobral; Drielly Santiago dos Santos; Kayky Dias de Oliveira; Pedro Soares Rangel; Glauco Santos; Marcos Antônio Taveira Fraga; João Guillherme Aires Chagas |
| **Data** | 30/09/2026 (versão 1) |

---

## 1. Escopo

*O que a atividade de teste se compromete a verificar, e o que ela declaradamente não verifica.*

Entra no escopo: os fluxos principais do produto ponta a ponta, as regras que protegem esses fluxos e o contrato que os sustenta, incluindo o comportamento do produto na fronteira quando uma dependência externa falha.

Fica fora do escopo: o comportamento de sistemas externos fora do controle da squad, os recursos físicos do dispositivo e o que custa mais do que devolve no prazo do projeto.

| Item | Dentro do escopo? | Motivo |
| --- | --- | --- |
| Perfil de Acesso (Cadastro e Login) | Sim | Controle de usuário e acessos. |
| Login, logout e sessão (cookie HttpOnly, validade de 24 h) | Sim | Protege todos os outros fluxos; toda rota de denúncia exige sessão. |
| Controle de acesso por perfil (Denunciante × Gestor) | Sim | Regra que separa as duas interfaces; precisa ser verificada no front e na API. |
| Registro de denúncia com categoria, bairro e descrição | Sim | Fluxo principal do Denunciante; regra de negócio concentrada aqui. |
| Denúncia anônima × identificada | Sim | Regra de privacidade; um erro aqui expõe a identidade do cidadão. |
| Histórico de denúncias do cidadão (inclusive as anônimas vinculadas à conta) | Sim | Fluxo principal do Denunciante. |
| Gestor lista e filtra denúncias | Sim | Fluxo principal do Gestor. |
| Gestor altera o status da denúncia (Em Andamento até Finalizada) | Sim | Máquina de estados; regra de negócio central do Gestor. |
| Dashboard de métricas do Gestor | Sim | Fluxo principal do Gestor; precisa ser consistente com a listagem. |
| Mapa de ocorrências por bairro | Sim | Fluxo principal do Gestor; inclui o comportamento de fallback de bairros do Recife quando o serviço de mapas falha. |
| Câmera e galeria do dispositivo no envio de foto | Não | Recurso físico do dispositivo; o anexo é verificado com arquivo de imagem. |
| Serviços de terceiros (tiles e serviços de mapas) | Não | Comportamento de terceiro, fora do controle da squad. Verifica-se apenas a fronteira (fallback interno de bairros). |
| Infraestrutura e deploy (Docker, Render, Vercel, PostgreSQL e Redis como produtos) | Não | Não é comportamento do produto. |
| Desempenho, carga e acessibilidade ampla | Não | Custa mais do que devolve no prazo do projeto. Risco aceito e registrado. |

**Verificação**

- [x] Todo fluxo principal do produto aparece como `Sim`.
- [x] Toda linha `Não` tem motivo.

---

## 2. Níveis de teste

*Em que altura do sistema cada condição é verificada, e quanto essa escolha custa.*

| Nível | O que responde | Dentro do plano? | Justificativa |
| --- | --- | --- | --- |
| Componente | A unidade isolada faz o que promete? | Sim | Regras puras (validação de campos, máquina de estados do status, autorização) são baratas de cobrir em todas as combinações. |
| Integração de componentes | As partes conversam entre si corretamente? | Sim | Middleware de autorização, controlador, serviço, banco e cache precisam conversar certo para proteger a separação Denunciante × Gestor. |
| Sistema | O sistema inteiro entrega o comportamento esperado? | Sim | Os fluxos principais (cadastro e login, denúncia anônima ou identificada, histórico, alteração de status pelo Gestor) só se provam com front, API e banco juntos. |
| Integração de sistemas | O produto conversa bem com sistemas de terceiros? | Não | Exigiria serviço externo no ar, credencial e cota fora do controle da squad. Só se verifica a fronteira, ou seja, o que o produto faz quando o terceiro falha. |
| Aceite | O usuário real aceita o que foi entregue? | Não | Não há cliente, ambiente de homologação nem base de usuários para executar UAT. |

---

## 3. Riscos da atividade de teste

*O que pode dar errado na própria verificação, e enganar quem lê o resultado.*

| Risco | Impacto | Prob. | Mitigação |
| --- | --- | --- | --- |
| Massa de teste do mapa desalinhada com o fallback de bairros do Recife | Médio | Média | Usar exatamente os bairros do fallback interno como massa de teste, nunca coordenadas inventadas. |
| Estado do Redis vazando entre execuções de teste (cache de uma execução interferindo na próxima) | Alto | Média | Nas execuções contra o ambiente real, usar banco Redis dedicado a testes, limpo (FLUSHDB) antes de cada execução; nunca compartilhar instância com o ambiente de desenvolvimento. |
| Cookie JWT expirando durante suíte automatizada longa, mascarando falha de fluxo como falha de autenticação | Médio | Baixa | Gerar ou renovar o cookie de sessão no setup de cada suíte; nunca depender do tempo real de expiração (24 h). |
| Caso de aceite do Gestor aprovado pela mesma pessoa que implementou a alteração de status | Alto | Média | Revisão cruzada: quem valida o critério de aceite de uma funcionalidade não pode ser quem a implementou. |
| Duplo de teste que não representa o produto implantado: a suíte de API usa um mock em memória no lugar de PostgreSQL e Redis | Alto | Média | Manter ao menos os testes E2E contra a stack real (Docker) como verificação de que o comportamento do mock vale para o produto implantado. |
| Teste não executado no fim do prazo | Alto | Alta | Casos de maior prioridade no backlog executados primeiro, com data e responsável registrados. |
| Execução manual sem evidência reconferível | Médio | Alta | Passo a passo e resultado esperado no caso; print ou log anexado. |
| Teste automatizado instável | Alto | Média | Espera por condição, nunca por tempo fixo; massa isolada por execução. |
| Oráculo derivado do próprio SUT | Alto | Média | Resultado esperado vem do critério de aceite, nunca da resposta observada. |

**Verificação**

- [x] Cada risco tem mitigação concreta.

---

## 4. Casos de teste

*Derivados dos requisitos.*

### 4.1 Primeira rodada com IA

**Prompt usado**

```
Gere casos de teste para o SOS Cidade, um sistema de denúncias urbanas com dois perfis (Denunciante e
Gestor). O Denunciante registra denúncias com categoria, bairro e opção de anonimato. O Gestor lista, filtra
e altera o status das denúncias (Em Andamento ate Finalizada) e visualiza um dashboard e um mapa por
bairro
```

**Saída recebida**

Arquivo: `saida-rodada-1.md`

> **Nota:** o arquivo contém a saída da rodada 1 reexecutada em 30/09/2026 com ChatGPT, em chat novo e com o mesmo prompt, pois a conversa original não estava disponível. As observações abaixo foram feitas sobre essa saída reexecutada.

**Três perguntas sobre a saída**

| Pergunta | Resposta | O que se observou na saída |
| --- | --- | --- |
| A LLM identificou lacunas? | Não | Preencheu tudo com plausibilidade e não listou lacunas nem requisitos ambíguos. O único sinal de dúvida é um hedge dentro de um caso (CT-19: "se a regra não permitir"). Não avisou sobre pontos indefinidos, como o comportamento de uma ação em andamento quando a sessão expira (CT-39) ou quem, internamente, ainda enxerga o autor de uma denúncia anônima (CT-04, CT-22, CT-38 e CT-45 só dizem que a identidade não é exposta ao Gestor). Ainda criou uma seção de "critérios importantes de aceite" (por exemplo, autorização verificada no backend) sem fonte nos requisitos. |
| Distribuiu os casos entre níveis? | Não | Os 45 casos vieram agrupados por tela e funcionalidade (Denunciante, Gestor, Dashboard, Mapa, Segurança), quase todos no nível de Sistema (fluxo via tela e login). Nenhum caso indica o nível. A seção de "integração e consistência" (CT-40 a CT-45) usa o rótulo, mas não separa componente, integração de componentes e sistema. |
| Indicou as técnicas de modelagem? | Não | Nenhuma técnica foi citada. O CT-19 (status finalizado não retorna) é transição de estados e os CT-02, CT-03 e CT-07 (campos obrigatórios) são partição de equivalência, mas a IA não nomeou as técnicas nem cobriu as demais transições e partições possíveis. |

### 4.2 Segunda rodada

**Insumos fornecidos no prompt**

- [x] **Requisitos:** as histórias de usuário e os critérios de aceite, na íntegra (arquivo `historias-usuario-criterios-aceite.md`, HU-01 a HU-16)
- [x] **Formato esperado:** os campos exatos dos casos de teste: id, HU, CA, título, pré-condições, passos, resultados esperados, pós-condições
- [x] **Escopo:** o que está dentro e o que está fora
- [x] **Níveis de teste:** quais níveis o plano cobre

**Prompt revisado**

> **Nota:** o prompt abaixo foi reconstruído a partir do roteiro da atividade, com os quatro insumos e os três pedidos, e foi o usado na reexecução da rodada 2. Deve ser substituído pelo prompt original da equipe quando for recuperado.

```
Você é um engenheiro de testes. Gere casos de teste para o SOS Cidade, sistema de denúncias urbanas com
dois perfis (Denunciante e Gestor).

INSUMOS
1. Requisitos: as histórias de usuário e os critérios de aceite abaixo, na íntegra.
   [colar o conteúdo de historias-usuario-criterios-aceite.md]
2. Formato esperado de cada caso, com exatamente estes campos: id, HU, CA, título (frase iniciada por
   verbo), pré-condições, passos (numerados, sem interpretação), resultado esperado (observável e único),
   pós-condições (inclusive quando a ação é recusada).
3. Escopo. Dentro: cadastro e login, sessão, controle de acesso por perfil, registro de denúncia,
   denúncia anônima × identificada, histórico do cidadão, listagem e filtros do Gestor, alteração de
   status, dashboard e mapa por bairro. Fora: câmera e galeria do dispositivo, serviços de terceiros
   (apenas a fronteira e o fallback interno de bairros), infraestrutura e deploy, desempenho, carga e
   acessibilidade ampla.
4. Níveis de teste. Dentro: Componente, Integração de componentes, Sistema. Fora: Integração de sistemas e
   Aceite.

PEDIDOS, nesta ordem, antes dos casos
A. Matriz de alocação: condição de teste | nível responsável | justificativa.
B. Tabela intermediária de derivação: regra | técnica aplicável | condições derivadas | casos resultantes.
C. Matriz de rastreabilidade de evidências: caso | HU | CA | trecho citado literalmente | suposição? (S/N).
   Onde não houver trecho no requisito, marque S e não invente regra.

Depois gere os casos, cada um com o nível e a técnica de modelagem usada (partição de equivalência,
valor-limite, tabela de decisão ou transição de estados). Aponte requisitos ambíguos ou lacunas em vez de
preenchê-los com suposições.
```

**O que mudou entre as duas saídas**

A rodada 1 devolveu 45 casos agrupados por tela, sem nível, sem técnica e sem apontar lacunas. A rodada 2 devolveu 66 casos, cada um ligado a uma HU e a um CA, com nível (Componente, Integração de componentes ou Sistema) e técnica nomeadas (partição de equivalência, valor-limite, tabela de decisão, transição de estados), acompanhados de matriz de alocação, tabela de derivação e matriz de rastreabilidade.

A diferença mais importante é que a rodada 2 **apontou lacunas em vez de preenchê-las**. Declarou que as HUs não definem o comportamento da denúncia anônima × identificada (e por isso não gerou casos para ele), nem a política de senha completa, nem os limites de coordenadas, nem a máquina de estados completa, nem a administração de contas de gestor (HU-16), nem a matriz de autorização de todos os endpoints.

Limitações observadas na rodada 2, sem correção da saída:

1. A matriz de rastreabilidade marca os 66 casos como não suposição (N), sem nenhuma exceção.
2. Dois casos da HU-06 citam critérios inexistentes: CT-25 como CA-07 e CT-26 como CA-08. A HU-06 vai de CA01 a CA07, e esses casos correspondem a CA06 e CA07.
3. Cinco critérios ficaram sem caso: HU-02 CA02 (login de gestor), HU-04 CA01 (perfil próprio), HU-09 CA04 (detalhe de terceiro), HU-11 CA02 (paginação com 250 demandas, justificada pela própria IA na lacuna 5) e HU-14 CA04 (métricas negadas ao cidadão).
4. Os casos seguem o domínio das HUs da disciplina (demandas, regiões RPA), e não o vocabulário do SOS Cidade (denúncias, bairros).

> **Nota sobre o conjunto de HUs:** as HU-01 a HU-16 são o conjunto de histórias fornecido pela disciplina, escrito para uma API de demandas urbanas (`/demands`, status `RECEIVED` a `RESOLVED`, autenticação por `accessToken`). O SOS Cidade implementa uma adaptação desse domínio (`/denuncias`, Denunciante e Gestor, sessão por cookie HttpOnly, denúncia anônima). Por isso, a rastreabilidade (4.5) marca como suposição o que só existe no SOS Cidade.

### 4.3 Matriz de alocação

*Pedida antes da geração dos casos.*

| Condição de teste | Nível responsável | Justificativa |
| --- | --- | --- |
| Gestor não consegue chamar `POST /denuncias` | Componente / Integração de componentes | Regra de autorização isolada no middleware, sem precisar do fluxo completo de UI. |
| Cidadão registra denúncia como anônima, ela some do nome público, mas continua no seu histórico | Sistema | Depende da API, do banco e da tela de histórico respondendo juntos. |
| Transição de status inválida (Finalizada → Em Andamento) é recusada | Componente | Máquina de estados é regra pura; dá para cobrir todos os pares origem → destino a custo baixo. |
| Requisição sem token, com token forjado ou com perfil errado é barrada | Integração de componentes | Exige middleware de autenticação e rota protegida juntos, sem UI. |
| E-mail duplicado no cadastro é rejeitado com mensagem amigável | Integração de componentes | Serviço de usuário e repositório precisam conversar para detectar a duplicidade. |
| Denúncia anônima não expõe o autor na resposta da API | Integração de componentes | Controlador, serviço e banco; a tela é verificada em separado no nível Sistema. |
| Cache de listagem é invalidado após criar, alterar ou excluir denúncia | Integração de componentes | Serviço com Redis; não precisa de navegador. |
| Fluxo do Denunciante: cadastro → login → nova denúncia → "Minhas denúncias" | Sistema | Só se prova com front, API e banco respondendo juntos. |
| Dashboard do Gestor é consistente com a listagem de denúncias | Sistema | Compara duas visões do mesmo dado; exige o ambiente completo. |
| Mapa por bairro agrupa corretamente e usa o fallback de bairros do Recife quando o serviço de mapas falha | Sistema (manual) | Comportamento visual; a fronteira com o serviço externo é verificada com a massa do fallback interno. |

### 4.4 Tabela intermediária de derivação

*Uma linha por regra do requisito.*

| Regra | Técnica aplicável | Condições derivadas | Casos resultantes |
| --- | --- | --- | --- |
| Status só pode avançar Em Andamento → Finalizada, nunca retroceder | Transição de estados | Transição válida; transição inválida (Finalizada → Em Andamento); repetição do status atual | R2-CT-51 a R2-CT-55, CT-DEN-12 |
| Login exige credenciais corretas | Partição de equivalência | Credencial válida (Denunciante e Gestor); senha errada; e-mail inexistente; corpo vazio | CT-AUT-01, CT-AUT-03 a CT-AUT-06 |
| E-mail é único no cadastro | Partição de equivalência | E-mail novo; e-mail já cadastrado | CT-USR-01 a CT-USR-03 |
| Rotas protegidas exigem autenticação | Tabela de decisão (token × rota) | Sem token; token forjado; token válido | CT-AUT-08 a CT-AUT-11, CT-DEN-04, CT-DEN-08, CT-DEN-11, CT-DEN-14, CT-DEN-16 |
| Acesso separado por perfil (Denunciante × Gestor) | Tabela de decisão (perfil × rota) | Denunciante tenta alterar status; Gestor tenta criar denúncia; perfis corretos nas mesmas rotas | Caso a criar (autorização por perfil, 403) |
| Denúncia pode ser anônima ou identificada | Tabela de decisão (anônima S/N × quem consulta) | Identificada vista pelo autor e pelo Gestor; anônima grava "Anônimo" e oculta o denunciante | CT-DEN-01, CT-DEN-02 |
| Listagem é paginada e cacheada | Transição de estados do cache e valor-limite | Miss → hit → invalidado após escrita; primeira página, última página e página vazia | CT-DEN-05 a CT-DEN-07, CT-DEN-15, CT-DEN-17 |
| Denúncia aceita imagem anexada e permite substituí-la | Partição de equivalência | Envio de imagem em base64; substituição da imagem existente | CT-DEN-03, CT-DEN-13 |

### 4.5 Matriz de rastreabilidade de evidências

*Onde não houver trecho do requisito, a linha é marcada como suposição em vez de virar regra. Trechos citados literalmente de `historias-usuario-criterios-aceite.md` ou do prompt da rodada 1. IDs com prefixo `R2-` são da rodada 2 (`saida-rodada-2.md`); `CT-AUT`, `CT-USR` e `CT-DEN` são os testes automatizados do repositório.*

| Caso | HU | CA | Trecho citado | Suposição? (S/N) |
| --- | --- | --- | --- | --- |
| CT-DEN-01 | HU-06 | Registro completo bem-sucedido | "Então a resposta é 201 com o objeto da demanda" | N |
| CT-DEN-02 | sem HU equivalente | Denúncia anônima | "opção de anonimato" (prompt da rodada 1) | S |
| CT-DEN-12 | HU-13 | Transição válida | "Então a resposta é 200 com a demanda atualizada" | N |
| R2-CT-53 | HU-13 | Transição proibida | "Então a resposta é 409 INVALID_STATUS_TRANSITION" | S |
| CT-AUT-08 a CT-AUT-10, CT-DEN-04, 08, 11, 14, 16 | HU-03 | Requisição sem token | "Então a resposta é 401 UNAUTHENTICATED" | N |
| Autorização por perfil (a criar) | HU-03 | Cidadão tenta operação exclusiva de gestor | "Então a resposta é 403 FORBIDDEN" | N |
| CT-AUT-11 | HU-02 | Login válido de cidadão | "recebo um accessToken JWT válido por 24 h" | S |
| CT-USR-03 | HU-01 | E-mail já cadastrado | "Então a resposta é 409 com code EMAIL_ALREADY_REGISTERED" | N |
| CT-DEN-07, CT-DEN-17 | sem HU equivalente | Cache de listagem | (sem trecho) detalhe de implementação, não requisito | S |
| CT-DEN-13 | sem HU equivalente | Substituição de imagens | (sem trecho) | S |

Observações: CT-AUT-11 é suposição porque o produto usa cookie HttpOnly e também aceita o cabeçalho `Authorization: Bearer`, enquanto a HU fala em `accessToken`. R2-CT-53 é suposição para o SOS Cidade porque o trecho vem da HU-13 (domínio de demandas), e o vocabulário de status do produto (Em Andamento, Finalizada) não é o da HU (`IN_PROGRESS`, `RESOLVED`); a regra de não retroceder foi adaptada.

### 4.6 Casos de teste

Arquivo: `saida-rodada-2.md`

> **Nota:** o arquivo contém a saída da rodada 2 reexecutada em 30/09/2026 com ChatGPT, em chat novo (66 casos, com matrizes de alocação, derivação e rastreabilidade e lista de lacunas), pois a conversa original não estava disponível. As tabelas 4.3 a 4.5 deste plano são o recorte adaptado ao SOS Cidade.
>
> **Os 66 casos são a saída bruta da IA e não um compromisso de execução.** Parte deles pode tratar de funcionalidades que o SOS Cidade não tem (por exemplo, notificações e administração de contas de gestor) ou que estão fora do escopo da seção 1. O compromisso deste plano é o recorte das seções 4.3 a 4.5 e os casos selecionados nas seções 5 e 6.

---

## 5. Seleção para automação

```
execuções até o retorno = Ti ÷ (Tm − Ta − Mn/F)
```

- **Tm** é o tempo de uma execução manual honesta, cronometrada uma vez, não estimada de cabeça.
- **Ti** é o investimento único; **Mn** é o que a automação consome por mês só para continuar funcionando.
- **F** é a frequência realista no horizonte do projeto, não a frequência ideal.
- "Não automatizar" nunca significa "não verificar": o caso continua no plano, com execução manual e responsável.

> **Pendência da versão 1:** Tm, Ti, Mn e F são estimativas de trabalho, ainda não cronometradas. Ta da suíte de API vem da execução real registrada no repositório (2,55 s no total, arredondado para 1 s por caso, de forma conservadora).

| ID | Nível | Tm manual/exec | Ti implementar | Ta auto/exec | Mn manut./mês | F exec./mês | Automatizar? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-DEN-04, 08, 11, 14, 16 (rotas exigem autenticação, 401 sem token) | Integração | 6 min | 40 min | 1 s | 5 min | 20 | Sim |
| Autorização por perfil, 403 (a criar) | Integração | 4 min | 30 min | 1 s | 3 min | 20 | Sim |
| CT-AUT-11 (token Bearer em rota protegida) | Integração | 4 min | 30 min | 1 s | 5 min | 20 | Sim |
| R2-CT-53 a R2-CT-55 (transições proibidas de status) | Componente | 3 min | 25 min | 0,1 s | 2 min | 20 | Sim |
| CT-DEN-02 (denúncia anônima) | Integração | 6 min | 45 min | 1 s | 5 min | 20 | Sim |
| CT-DEN-12 (status Finalizada pelo Gestor) | Integração | 5 min | 40 min | 1 s | 5 min | 20 | Sim |
| CT-USR-03 (e-mail duplicado) | Integração | 3 min | 20 min | 1 s | 3 min | 20 | Sim |
| CT-DEN-07 e CT-DEN-17 (cache Redis) | Integração | 10 min | 60 min | 1 s | 10 min | 20 | Sim |
| CT-DEN-13 (substituição de imagens) | Integração | 5 min | 35 min | 1 s | 4 min | 20 | Sim |
| E2E Denunciante (fluxo completo) | Sistema | 10 min | 120 min | 15 s | 20 min | 8 | Sim |
| E2E Dashboard do Gestor (consistência) | Sistema | 6 min | 90 min | 15 s | 25 min | 4 | Não, permanece manual |
| E2E Mapa por bairro | Sistema | 8 min | 180 min | 20 s | 40 min | 2 | Não, permanece manual |

**Conta por caso** (tempos em minutos)

- CT-DEN-04, 08, 11, 14, 16 (401 sem token): 40 ÷ (6 − 0,02 − 0,25) ≈ 7 execuções.
- Autorização por perfil (403): 30 ÷ (4 − 0,02 − 0,15) ≈ 8 execuções.
- CT-AUT-11: 30 ÷ (4 − 0,02 − 0,25) ≈ 8 execuções.
- R2-CT-53 a R2-CT-55: 25 ÷ (3 − 0,00 − 0,10) ≈ 9 execuções.
- CT-DEN-02: 45 ÷ (6 − 0,02 − 0,25) ≈ 8 execuções.
- CT-DEN-12: 40 ÷ (5 − 0,02 − 0,25) ≈ 9 execuções.
- CT-USR-03: 20 ÷ (3 − 0,02 − 0,15) ≈ 7 execuções.
- CT-DEN-07 e 17: 60 ÷ (10 − 0,02 − 0,5) ≈ 7 execuções.
- CT-DEN-13: 35 ÷ (5 − 0,02 − 0,20) ≈ 7 execuções.
- E2E Denunciante: 120 ÷ (10 − 0,25 − 2,5) ≈ 17 execuções, cerca de 2 meses a 8 execuções por mês. Compensa dentro do horizonte do projeto.
- E2E Dashboard: 90 ÷ (6 − 0,25 − 6,25) dá negativo. A manutenção sozinha custa mais do que a execução manual economiza.
- E2E Mapa: 180 ÷ (8 − 0,33 − 20) dá negativo, pelo mesmo motivo, agravado pela frequência baixa.

Os dois casos E2E que permanecem manuais continuam no plano, com execução manual por entrega, resultado esperado escrito, print anexado como evidência e responsável definido. A decisão muda se a frequência subir.

---

## 6. Backlog de automação

```
prioridade = (Risco × Frequência) ÷ Custo
```

Escalas de 1 a 3. Heurística de ordenação. Empate se desfaz pelo risco; persistindo o empate, o caso ainda não automatizado vem primeiro, por ser o que mais amplia a cobertura.

| Ordem | ID do caso | HU | Nível | Risco | Custo | Frequência | Prioridade | Responsável | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Autorização por perfil, 403 (a criar) | HU-03 (CA01 e CA02) | Integração | 3 | 1 | 3 | 9,0 | A definir | A fazer |
| 2 | CT-DEN-04, 08, 11, 14, 16 | HU-03 (CA05, sem token) | Integração | 3 | 1 | 3 | 9,0 | A definir | Automatizado (`tests/04_denuncias.test.ts`) |
| 3 | CT-AUT-11 | HU-02 (sessão e token) | Integração | 2 | 1 | 3 | 6,0 | A definir | Automatizado (`tests/02_auth.test.ts`) |
| 4 | R2-CT-53 a R2-CT-55 | HU-13 (transição proibida) | Componente | 3 | 2 | 3 | 4,5 | A definir | A fazer |
| 5 | CT-DEN-02 | Denúncia anônima | Integração | 3 | 2 | 3 | 4,5 | A definir | Automatizado (`tests/04_denuncias.test.ts`) |
| 6 | CT-DEN-12 | HU-13 (transição válida) | Integração | 2 | 2 | 3 | 3,0 | A definir | Automatizado (`tests/04_denuncias.test.ts`) |
| 7 | CT-USR-03 | HU-01 (e-mail duplicado) | Integração | 1 | 1 | 3 | 3,0 | A definir | Automatizado (`tests/03_users.test.ts`) |
| 8 | E2E Denunciante | HU-06, HU-08 | Sistema | 3 | 3 | 2 | 2,0 | A definir | Automatizado (`e2e/tests/denunciante-fluxo-completo.spec.ts`) |
| 9 | CT-DEN-07 e CT-DEN-17 | Listagem e cache | Integração | 2 | 3 | 3 | 2,0 | A definir | Automatizado (`tests/04_denuncias.test.ts`) |
| 10 | CT-DEN-13 | Imagens da denúncia | Integração | 1 | 2 | 2 | 1,0 | A definir | Automatizado (`tests/04_denuncias.test.ts`) |

Desempates: ordens 1 e 2 (9,0), o caso ainda não automatizado vem primeiro. Ordens 4 e 5 (4,5), mesma regra. Ordens 6 e 7 (3,0), risco 2 contra 1. Ordens 8 e 9 (2,0), risco 3 contra 2.

**Verificação**

- [x] O primeiro item é de risco alto, custo baixo e frequência alta.

---

## 7. Limitações conhecidas desta versão

1. As saídas das rodadas 1 e 2 (`docs/testes/ia/saida-rodada-1.md` e `saida-rodada-2.md`) são reexecuções de 30/09/2026; substituir pelas conversas originais, se forem recuperadas.
2. O prompt revisado da rodada 2 foi reconstruído e deve ser substituído pelo original.
3. Tm, Ti, Mn e F da seção 5 são estimativas e devem ser substituídos por tempos cronometrados.
4. A coluna Responsável do backlog será preenchida na próxima versão.
5. As HU-01 a HU-16 pertencem a um domínio de demandas urbanas ligeiramente diferente do SOS Cidade; a rastreabilidade marca como suposição o que só existe no produto.
6. Confirmado no repositório: CT-DEN-04, 08, 11, 14 e 16 verificam apenas a resposta 401 sem token. Não há teste de autorização por perfil (403), que entra no backlog como caso a criar.
7. Confirmado no repositório: não há teste que verifique que uma denúncia anônima aparece no histórico do próprio autor (CT-DEN-02 só verifica a gravação de "Anônimo" na criação), nem teste de transição de status inválida (R2-CT-53 a R2-CT-55). Ambos são lacunas de cobertura a tratar na versão 2.
