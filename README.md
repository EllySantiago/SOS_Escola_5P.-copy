# SOS-Cidade

Sistema de denúncias urbanas para Recife. Cidadãos registram ocorrências; gestores acompanham e atualizam os atendimentos.

## Partes do projeto

| Parte | Tecnologia | Para que serve |
|---|---|---|
| `mobile/` | Expo, React Native, TypeScript | App Android/iOS e execução web |
| `frontend/` | Next.js, TypeScript | Site para cidadãos e gestores |
| `backend/` | Express, Prisma, PostgreSQL | API, autenticação e regras de negócio |
| `e2e/`, `tests/` | Playwright, Jest/Supertest | Testes web, API e contratos |
| `ETL/` | Python | Importa dados históricos de clima |

Mobile e site chamam a mesma API. O backend grava no PostgreSQL e usa Redis como cache. Veja o [resumo de arquitetura e segurança](RESUMO-ARQUITETURA-SEGURANCA.md).

## Perfis

- **Denunciante:** cria e acompanha as próprias denúncias.
- **Gestor:** consulta ocorrências e atualiza seu atendimento.

O backend aplica autenticação e permissões; a navegação por perfil no app/site não é a barreira de segurança. Uma denúncia anônima esconde o nome na resposta, mas mantém vínculo interno com a conta.

## Executar localmente

Requisitos: Docker Desktop, Node.js e npm.

```powershell
docker compose up --build -d
```

Depois de iniciar: site em `http://localhost:3000`, API em `http://localhost:8000`, saúde em `/health`. O Compose usa credenciais e chaves fixas apenas para desenvolvimento; não as reutilize em produção.

Para executar o aplicativo, consulte [mobile/README.md](mobile/README.md). Ele explica Expo Go, endereço da API no celular e contas locais de teste.

## Testes e workflows

Na raiz: `npm run test:unit` executa unitários frontend, backend e mobile. Testes de API usam `npm run test:api`; smoke web usa `npm run test:e2e:smoke`.

Todos os workflows em `.github/workflows/` têm execução manual em **Actions → Run workflow**. O de manutenção pede o número da issue. A integração mobile testa serviços HTTP contra backend real, não telas nativas.

## Segurança: limites importantes

- Senhas têm hash; autenticação e autorização ficam no backend.
- Nome identificado e descrição são criptografados; imagens e outros dados não recebem a mesma proteção.
- O token web também é gravado em cookie acessível a JavaScript.
- O cache de denúncias mobile usa armazenamento local sem criptografia.
- Neste checkout, o backend não bloqueia transições inválidas de situação enviadas diretamente à API.
- Retenção de dados, atendimento a titulares e resposta a incidentes ainda precisam de definição.

Não é possível afirmar conformidade completa com a LGPD ou prontidão para produção. Veja a [avaliação de segurança](mobile/docs/seguranca/seguranca-lgpd.md).

## Documentação

- [Índice dos documentos mobile](mobile/docs/README.md)
- [Backlog de testes mobile](mobile/docs/testes/backlog-testes-mobile.md)
- [Quality gate e execução manual](mobile/docs/testes/quality-gate.md)
- [Resumo de arquitetura e segurança](RESUMO-ARQUITETURA-SEGURANCA.md)
- [Testes E2E](e2e/README.md)
