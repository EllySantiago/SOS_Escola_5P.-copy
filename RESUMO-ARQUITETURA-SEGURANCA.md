# Resumo: arquitetura, relações e segurança

Revisão estática do checkout local em 25/11/2026. A pasta não tem `.git`; portanto, este documento descreve os arquivos presentes, não garante que sejam iguais à `main` pública de Kayky. Veja a [avaliação detalhada de segurança](mobile/docs/seguranca/seguranca-lgpd.md) e o [índice de documentos mobile](mobile/docs/README.md).

## Como as partes trabalham juntas

```text
Aplicativo Expo / React Native ─┐
                                ├─ HTTP/JSON ─> API Express ─> PostgreSQL
Frontend web Next.js ───────────┘                  └────────> Redis (cache)
```

- **Mobile:** organiza as telas com Expo Router e chama serviços HTTP. Android/iOS guardam o token no SecureStore; listas podem ser lidas de um cache local AsyncStorage quando a rede falha.
- **Frontend web:** usa páginas Next.js, stores de sessão e chamadas HTTP para a mesma API. O servidor web e o aplicativo móvel compartilham o contrato de usuários e denúncias.
- **Backend:** aplica autenticação e autorização, executa as regras de negócio, protege alguns campos com criptografia e acessa PostgreSQL. Redis é cache operacional, não a fonte oficial dos dados.
- **Fluxo de denúncia:** o app ou o site envia dados para a API; a API associa a denúncia ao usuário autenticado, grava no banco e devolve dados para acompanhamento. Uma denúncia anônima esconde nome e identificador nas respostas, mas mantém a associação interna com a conta.
- **Workflows:** GitHub Actions executa testes unitários, API, smoke web, regressão completa e integração HTTP mobile-backend. Não há automação de interface nativa Android/iOS.

## Curadoria: divergências relevantes encontradas

| Gravidade | Achado | Impacto e evidência |
|---|---|---|
| **Alta** | O backend não valida transições de situação de denúncias neste checkout. | `PATCH /denuncias/:id` encaminha a situação ao serviço, que grava o valor sem validar transição; a criação também aceita situação, protocolo e datas enviados pelo cliente. Uma denúncia finalizada pode ser alterada por chamada direta à API. Corrigir no servidor e testar. |
| **Alta** | O token web não fica protegido apenas pelo cookie `HttpOnly`. | O login devolve o token no corpo da resposta e o frontend o grava com `js-cookie`, acessível a JavaScript. O cookie `HttpOnly` emitido pelo backend não protege essa cópia. |
| **Média** | Cache mobile de denúncias fica sem criptografia no AsyncStorage. | O cache melhora leitura sem rede e é separado por usuário, mas dados ficam no aparelho em armazenamento comum. A limpeza no logout/expiração pode falhar e apenas registrar aviso. |
| **Média** | A segurança de armazenamento do token muda na versão web do app. | Android/iOS usam SecureStore; no web, a implementação usa AsyncStorage. Não considerar essas plataformas equivalentes em proteção. |
| **Média** | Documentação mobile estava divergente da implementação. | O README dizia que não havia cache offline; o código possui cache. Backlog/TAS diziam que criar gestor não era compatível, mas app e web chamam `/users/gestores`, protegido e implementado no backend. O middleware responde 401 para token ausente/inválido e 403 para perfil sem autorização; alguns textos diziam que token inválido gerava 403. |
| **Pendência** | A criptografia em repouso cobre somente alguns campos. | Nome identificado e descrição são criptografados; imagens, e-mail, bairro, situação e outros dados não. Conteúdo e fotos também podem identificar quem escolheu denúncia anônima. |
| **Pendência** | Configuração local não é configuração segura de produção. | `docker-compose.yml` traz credenciais e chaves fixas de desenvolvimento. Segredos próprios, HTTPS, retenção de dados, canal para titulares e resposta a incidentes precisam ser tratados antes de produção. |

## O que já está protegido e o que isso não significa

- Senhas são armazenadas com hash e o backend exige segredo JWT e chave de criptografia definidos no ambiente.
- Rotas administrativas e leitura de denúncias passam por autenticação e verificações de perfil/autoria.
- O cadastro público cria denunciante; criação de gestor usa rota separada e autorizada.
- O app nativo armazena a sessão no SecureStore; o web e o cache de denúncias usam armazenamento acessível no dispositivo/navegador.
- Há registro de aceite dos documentos legais, mas isso, por si só, não prova conformidade completa com a LGPD.

**Conclusão:** há controles úteis de autenticação, perfil e acesso aos dados, mas ainda não é possível declarar conformidade completa ou prontidão para produção. Prioridades: validar entradas e transições no backend; eliminar a cópia JavaScript do token web; decidir como proteger/minimizar o cache móvel; e completar governança de privacidade, retenção e operação.

## Documentação por finalidade

Veja [`mobile/docs/`](mobile/docs/README.md) para a documentação organizada de integração, testes, segurança e acompanhamento.
