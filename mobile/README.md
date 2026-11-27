# SOS-Cidade Mobile

Aplicativo Expo/React Native para Android e iOS, com execução web configurada. O app usa a API do projeto; web não é PWA.

## Iniciar localmente

Requisitos: Node.js/npm. Para usar cadastro, denúncias e painel, também é necessário Docker Desktop.

```powershell
# Na raiz do projeto
docker compose up --build -d db redis api

# Em outro terminal, dentro de mobile/
npm install
npm run start:go
```

O seed local cria estes usuários de teste:

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor1.teste@soscidade.com` | `Teste@123` |
| Gestor | `gestor2.teste@soscidade.com` | `Teste@123` |
| Denunciante | `denunciante.teste@soscidade.com` | `Teste@123` |

Use essas contas e os dados seed somente em desenvolvimento. Para celular físico, configure `mobile/.env` com `EXPO_PUBLIC_API_URL=http://<IPv4-do-computador>:8000`. Em emulador Android use `http://10.0.2.2:8000`; `localhost` no telefone aponta para o próprio telefone. Para abrir a interface web, rode `npm run web`.

## O que o app oferece

- **Denunciante:** cadastro, aceite de documentos, criação de denúncia com bairro/fotos e consulta das próprias ocorrências.
- **Gestor:** lista, filtros, mapa/dashboard, atualização de situação e gestão de contas de gestor.
- **Dispositivo:** localização em primeiro plano, seleção/captura de fotos e notificações locais.

Não há notificação push remota nem automação de telas Android/iOS. Consulte o [acompanhamento de entrega](docs/entrega/ACOMPANHAMENTO.md) para limites e itens pendentes.

## Como o app se relaciona com o backend

```text
Expo Router -> telas e hooks -> stores/serviços HTTP -> API Express -> PostgreSQL
                                                       -> Redis (cache de consultas)
```

Rotas e navegação ficam em `app/`; código de interface e integração em `src/`. O app e o frontend web usam endpoints compartilhados. O backend é responsável por autenticação, perfil e autorização; guardar telas por perfil no app não substitui essa verificação.

Denúncias anônimas não exibem nome nem identificador da conta na resposta, mas permanecem relacionadas à conta no banco. Nome e descrição são criptografados no backend; imagens não recebem a mesma proteção.

## Sessão, cache e segurança

- Android/iOS guardam o token no SecureStore e o enviam como Bearer.
- O estado básico de sessão persiste em AsyncStorage. Na versão web do app, o token também usa AsyncStorage, que não é equivalente ao SecureStore.
- Listas de denúncias podem ser lidas offline a partir de cache AsyncStorage **sem criptografia**. Criar e alterar dados exige rede. A limpeza do cache no logout é tentada, mas pode falhar.
- O site web armazena uma cópia JavaScript do token de sessão; o cookie `HttpOnly` do backend não protege essa cópia.
- O backend neste checkout não valida transições de situação de denúncias em chamadas diretas.

Esses limites impedem afirmar conformidade completa com a LGPD ou prontidão para produção. Veja o [resumo de arquitetura e segurança](../RESUMO-ARQUITETURA-SEGURANCA.md).

## Testes

Dentro de `mobile/`: `npm run test:ci` para Jest; `npm run test:integration:backend` para integração HTTP com backend local e banco descartável; `npx tsc --noEmit` para TypeScript.

O workflow [`mobile-backend-integration.yml`](../.github/workflows/mobile-backend-integration.yml) roda manualmente e em PRs que alteram Mobile/Backend. Ele não abre emulador nem testa interface nativa.

Documentação e gestão dos testes: [`docs/testes/`](docs/testes/README.md). O backlog é detalhado; os outros documentos estão limitados a 100 linhas.

## Build Android

Os perfis EAS `development`, `preview` e `production` estão configurados em `eas.json`. Para gerar um APK interno, após configurar a conta e API HTTPS:

```sh
eas login
eas build -p android --profile preview
```

Configuração não significa que o serviço ou um build já esteja publicado. Nunca use as credenciais ou chaves fixas do Compose em produção.
