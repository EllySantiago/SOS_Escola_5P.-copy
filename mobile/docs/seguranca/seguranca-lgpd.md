# Segurança e LGPD — resumo

Revisão estática do checkout local em 25/11/2026. A pasta não tem `.git`; estes achados descrevem os arquivos locais, não confirmam a `main` pública.

## Histórico entre branches

- **21/09/2026:** análise inicial feita antes de integrar correções.
- **25/09/2026:** algumas correções estavam em uma branch secundária, não na branch de referência. Foram reaplicadas depois na branch de segurança.
- **24/11/2026:** consulta pública registrou que a integração entre branches ainda era parcial. Esse registro histórico foi mantido; não prova o estado atual do checkout.
- **25/11/2026:** a cópia local foi revisada novamente, mas sem histórico Git não foi possível identificar sua branch.

## O que já existe

- Senhas são armazenadas com hash. O backend exige segredo JWT e chave de criptografia definidos no ambiente.
- A API autentica as requisições e limita operações administrativas a gestores.
- Denunciantes consultam suas próprias denúncias; gestores podem consultar as ocorrências para administrá-las.
- Criação pública cria denunciante. Criar gestor usa rota separada, protegida para gestores.
- Aceites dos Termos de Uso e da Política de Privacidade são registrados com data e versão.
- Nome identificado e descrição da denúncia são criptografados no banco.
- Denúncia anônima não mostra nome nem identificador da conta na resposta, mas continua ligada à conta no banco para acompanhamento.

## Riscos e lacunas

1. **Alta — regras de situação incompletas no backend.** A atualização grava a situação recebida sem conferir transições; a criação também aceita situação, protocolo e datas enviados pelo cliente. Uma tela não substitui validação no servidor.
2. **Alta — token web acessível a scripts.** O login devolve o token no corpo da resposta e o frontend o grava com `js-cookie`. O cookie `HttpOnly` do backend não protege essa cópia.
3. **Média — cache móvel sem criptografia.** Listas ficam no AsyncStorage para leitura offline. A limpeza no logout é tentada, mas pode falhar.
4. **Média — web mobile não tem SecureStore.** Android/iOS usam armazenamento protegido para o token; a versão web usa AsyncStorage.
5. **Parcial — criptografia.** Fotos, e-mail, bairro e outros dados não recebem a mesma proteção. Se a leitura de um campo criptografado falha, o código pode devolver o valor armazenado sem decifrá-lo.
6. **Pendente — privacidade e operação.** Não há política/rotina de retenção, autoexclusão de conta, canal documentado para pedidos dos titulares ou processo de resposta a incidentes.
7. **Pendente — produção.** O Compose contém credenciais e chaves fixas de desenvolvimento. Não usar esses valores em produção. A API publicada e HTTPS precisam ser verificados no ambiente real.
8. **Anonimato limitado.** O vínculo interno continua salvo; texto e imagens também podem revelar a identidade.

## Conclusão simples

Há proteções úteis, mas não é possível afirmar conformidade completa com a LGPD nem prontidão para uso real. Prioridades: validar dados e transições no backend, retirar a cópia JavaScript do token, proteger/minimizar o cache e definir retenção e atendimento aos titulares. É uma avaliação técnica, não um parecer jurídico.

## Fontes principais

- Backend: `backend/src/controllers/auth.controller.ts`, `backend/src/controllers/denuncia.controller.ts`, `backend/src/services/denuncia.service.ts`.
- Web: `frontend/src/store/useAuthStore.ts`, `frontend/src/lib/api.ts`.
- Mobile: `mobile/src/store/useAuthStore.ts`, `mobile/src/services/secureStorage.ts`, `mobile/src/services/cacheService.ts`.
- Resumo das relações: [`RESUMO-ARQUITETURA-SEGURANCA.md`](../../../RESUMO-ARQUITETURA-SEGURANCA.md).
