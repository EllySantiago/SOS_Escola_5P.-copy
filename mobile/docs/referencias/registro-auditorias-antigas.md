# Registro resumido de auditorias anteriores

Este resumo substitui cópias longas e repetidas que ficavam em `tests/mobile/`. Elas foram feitas sobre versões/ZIPs antigos; não usar como descrição do estado atual sem conferir o código.

## O que as auditorias antigas apontaram

- Divergência entre cadastro público e criação de gestor.
- Diferenças entre categorias, datas e valores de situação enviados por web, mobile e backend.
- Proteção incompleta do token web e dependência de guardas de navegação no cliente.
- Necessidade de testes mobile, sem confundir unitários com E2E nativo.

## Situação no checkout revisado em 25/11/2026

- **Gestor:** resolvido no código atual: app e web usam `POST /users/gestores`, protegido para `GESTOR`; integração HTTP cobre a rota.
- **Token web:** continua exposto ao JavaScript porque a resposta inclui token e o frontend o grava com `js-cookie`.
- **Token nativo:** SecureStore em Android/iOS; a versão web usa AsyncStorage.
- **Cache:** listas offline ficam em AsyncStorage sem criptografia.
- **Situação da denúncia:** o backend atual não valida transições no endpoint de atualização.
- **Testes:** Jest tem 45 casos em 9 suites e integração HTTP tem 10 cenários; não há E2E nativo em emulador.
- **Categorias/datas:** validar compatibilidade com registros existentes antes de padronizar; não fazer migração sem plano.

Para a análise atual, consulte o [resumo de arquitetura e segurança](../../../RESUMO-ARQUITETURA-SEGURANCA.md), o [backlog de testes](../testes/backlog-testes-mobile.md) e a [avaliação de segurança](../seguranca/seguranca-lgpd.md).
