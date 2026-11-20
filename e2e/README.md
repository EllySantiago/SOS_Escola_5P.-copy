# Testes E2E — SOS-Cidade

Testes ponta a ponta (E2E) usando **Playwright**, simulando o uso real da aplicação
pelo navegador: cadastro, login, criação de denúncia e verificação na listagem.

## O que está coberto

| Arquivo | O que testa |
|---|---|
| `tests/denunciante-fluxo-completo.spec.ts` | Cadastro com aceite legal, login, senha errada, criação de denúncia anônima e histórico |
| `tests/fluxo-denuncia-cidadao.spec.ts` | Cadastro, login, denúncia e conferência em "Minhas Denúncias" |
| `tests/gestor-fluxo.spec.ts` | Login do gestor seed e acesso ao Dashboard; cadastro de denunciante pela API e tentativa de acesso à área do gestor |

## Pré-requisitos

A aplicação precisa estar rodando localmente **antes** de executar os testes.
Na raiz do projeto principal (não desta pasta de testes):

```powershell
docker compose up --build -d db redis api web
```

Isso aplica as migrations e o seed local, e sobe banco (5432), Redis (6379),
backend (8000, http://localhost:8000) e frontend (3000, http://localhost:3000).
O seed cria contas de teste e três denúncias fictícias; use apenas localmente.

## Instalação e execução

Dentro desta pasta:

```powershell
npm ci
npx playwright install chromium
npm test
npm run test:headed
npm run test:ui
npm run report
```

## Por que esse fluxo foi escolhido

O cadastro → login → nova denúncia → aparecer na listagem é o **caminho crítico**
do sistema: se ele quebrar, nenhuma outra tela (dashboard, mapa) tem dado pra
mostrar. Por isso ele foi priorizado como o cenário principal de E2E.

O teste de "denunciante tentando acessar o Dashboard do gestor" valida o guard
de navegação do frontend. A API também deve validar permissões nas rotas
protegidas; um redirecionamento no navegador, sozinho, não é uma barreira de
segurança para endpoints.

## Observação sobre dados de teste

O seed configurado em `backend/prisma/seed.ts` cria contas de gestor,
`denunciante.teste@soscidade.com` e três denúncias. O fluxo E2E do denunciante
também cria usuário com e-mail único; o teste de acesso de perfil usa esse
cadastro público via API e envia os aceites legais obrigatórios.

## Limitação conhecida

Os testes assumem banco de dados "vivo" entre execuções (sem reset automático).
Usuários e denúncias criados pelos fluxos podem se acumular no banco local;
não execute a suíte contra produção.
