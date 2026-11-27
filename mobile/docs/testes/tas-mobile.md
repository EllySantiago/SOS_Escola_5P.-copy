# Manutenção de testes mobile

Estado em 25/11/2026: 9 suites Jest com 45 testes; 10 testes de integração HTTP com backend real. Existe workflow de integração mobile. Não há Maestro, teste de telas em emulador ou E2E nativo. Playwright cobre o site web.

## Classificação de falhas

| Label | Quando usar | Exemplo |
|---|---|---|
| `falha:sut` | App ou API erra quando reproduzido manualmente | Denúncia válida não é salva |
| `falha:tas` | O fluxo de teste está errado, mas o produto funciona | Seletor aponta para um rótulo antigo |
| `falha:ambiente` | Emulador, backend ou rede não inicia | Dispositivo Android offline |
| `falha:esperada` | Mudança intencional ainda não refletida no teste | Botão foi renomeado |

Na dúvida entre defeito do app e teste, trate como `falha:sut` até investigar. Guarde logs e evidências; uma nova tentativa não apaga a primeira falha.

## Prioridade e instabilidade

- **Alta:** falha reproduzida em login, autorização ou envio de denúncia; corrigir em até 1 dia útil.
- **Média:** integração ou jornada importante sem impacto imediato; alvo de até 3 dias úteis.
- **Baixa:** duplicação, lentidão ou fluxo não crítico.
- **Instável (`flaky`):** falhou e passou na repetição. Registrar a ocorrência e investigar; quarentena é temporária, nunca esconder falha funcional. Remover da quarentena após corrigir a causa e obter 5 execuções verdes.

O documento geral `docs/tas.md` citado em versões antigas não está neste checkout. Confirme prazos e responsáveis gerais com a equipe antes de aplicá-los.

## Execução automatizada existente

| Workflow | Gatilhos | Cobertura |
|---|---|---|
| `mobile-backend-integration` | PR com alterações mobile/backend e execução manual | Serviços HTTP mobile contra API real e banco descartável |
| `unit-api` | Push, PR para main e manual | Jest mobile, testes unitários frontend/backend e API |
| `e2e-smoke` | PR para main e manual | Jornadas web Playwright |
| `regressao-completa` | Agendado e manual | Suítes unitárias, API, E2E web e quarentena web |

O botão **Run workflow** só aparece quando a configuração está na branch padrão. `rotular-manutencao` também pode ser iniciado manualmente informando o número da issue. O workflow de integração mobile não abre issues automaticamente; a quarentena existente é para E2E web.

## Limites e revisões

- Integração HTTP comprova contrato entre serviços e API; não comprova navegação visual ou funcionamento em Android/iOS.
- Enquanto não houver E2E nativo, Maestro é apenas uma proposta; não marcar fluxos nativos como implementados.
- Revisar a cada duas semanas quando os fluxos nativos existirem: instabilidade, duração, duplicação e ligação com o [backlog](backlog-testes-mobile.md).
- Não remover teste de segurança ou regressão sem reproduzir, documentar risco e obter aprovação da equipe.

