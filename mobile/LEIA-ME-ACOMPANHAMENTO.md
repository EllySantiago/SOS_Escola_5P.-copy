# Quadro de entregas do professor

**Branch:** `refatoracao`

**Commit de referência:** `c6f80fea4d2c9c15d00c4e27d43b4618fe93c13a` (`atualização de mobile`)

**Última verificação:** 19/11/2026

**Legenda:** `[x]` = há implementação ou configuração comprovada; `[ ]` = não comprovado neste repositório.

**Importante:** o app ativo fica na raiz `mobile/`, apontada por `mobile/package.json`. A cópia aninhada `mobile/mobile/` e os arquivos antigos duplicados foram removidos.

---

## Acompanhamento 15/09 - React Native com Expo

### [x] Aplicativo em React Native com Expo

- **Status:** Feito
- **Evidência:** [mobile/package.json](./package.json), dependências `expo`, `react-native` e `expo-router`, e [mobile/app.json](./app.json), com blocos iOS, Android e web.
- **Função:** configuração de SDK Expo, ponto de entrada `index.ts` e plugins nativos.
- **Observação real:** a entrega é Android/iOS e também possui configuração web (`react-native-web`, script `web` e bloco `web` no `app.json`). O que não existe é uma PWA com manifest/service worker; portanto, não tratar web como PWA.

### [ ] Exclusividade Android/iOS sem web/PWA

- **Status:** Não feito
- **Evidência:** [mobile/package.json](./package.json:18-33) declara `react-native-web`, React DOM e o script `web`; [mobile/app.json](./app.json:34-37) declara o bundler web.
- **O que falta:** remover ou confirmar oficialmente que web não faz parte do escopo. Hoje o projeto aceita execução web.

### [x] Arquitetura organizada por rotas, telas, componentes e serviços

- **Status:** Feito
- **Evidência:** [mobile/app/_layout.tsx](./app/_layout.tsx:1-24), layouts por perfil em [mobile/app/(gestor)/_layout.tsx](./app/%28gestor%29/_layout.tsx:1-57) e [mobile/app/(denunciante)/_layout.tsx](./app/%28denunciante%29/_layout.tsx:1-57), telas em [mobile/src/screens/routes/](./src/screens/routes/) e componentes em [mobile/src/components/](./src/components/).
- **Refatoração:** removidos os arquivos não utilizados da arquitetura antiga; Expo Router é o único fluxo de rotas e telas.

### [x] Separação em stores, hooks, tipos e serviços

- **Status:** Feito
- **Evidência:** autenticação em [mobile/src/store/useAuthStore.ts](./src/store/useAuthStore.ts:1-84), clientes HTTP em [mobile/src/services/http.ts](./src/services/http.ts:1-38), tipos em [mobile/src/types/](./src/types/) e regras compartilhadas em [mobile/src/hooks/](./src/hooks/).
- **Observação:** a implementação ativa pode ser descrita como uma arquitetura em camadas com hooks/stores, não como MVVM puro.

### [x] Integração com backend por HTTP

- **Status:** Feito
- **Evidência:** `API_BASE_URL` em [mobile/src/constants/config.ts](./src/constants/config.ts:1-6), `fetch` e `Authorization: Bearer` em [mobile/src/services/http.ts](./src/services/http.ts:7-36), login em [mobile/src/services/authService.ts](./src/services/authService.ts:30-37), denúncias em [mobile/src/services/denunciaService.ts](./src/services/denunciaService.ts:38-75) e usuários em [mobile/src/services/userService.ts](./src/services/userService.ts:5-17).
- **Observação:** o backend atual aceita cookie ou o header Bearer em [backend/src/middlewares/auth.middleware.ts](../backend/src/middlewares/auth.middleware.ts:5-22).

---

## Acompanhamento 25/09 - GPS, câmera e CRUD

### [x] GPS com Expo Location

- **Status:** Feito
- **Evidência:** [mobile/src/components/denuncia/LocalizacaoButton.tsx](./src/components/denuncia/LocalizacaoButton.tsx:1-51).
- **Função:** `locate`, aproximadamente em 17-46: pede permissão em primeiro plano, chama `getCurrentPositionAsync`, faz `reverseGeocodeAsync` e resolve o bairro.
- **Observação:** não há rastreamento em segundo plano; a implementação é localização sob demanda.

### [ ] Câmera com Expo Camera

- **Status:** Parcial
- **Evidência:** `expo-camera` está declarado em [mobile/package.json](./package.json:12) e configurado em [mobile/app.json](./app.json:52-57).
- **Evidência de uso real:** a captura usa `expo-image-picker`, em [mobile/src/components/denuncia/FotosPicker.tsx](./src/components/denuncia/FotosPicker.tsx:23-44); `launchCameraAsync` abre a câmera por meio do Image Picker.
- **O que falta:** não foi encontrado uso da API `CameraView`/`Camera` de `expo-camera`. Se a exigência é especificamente “Expo Camera”, ela está configurada mas não integrada diretamente.

### [x] Fotos da denúncia com galeria e limite

- **Status:** Feito
- **Evidência:** [mobile/src/components/denuncia/FotosPicker.tsx](./src/components/denuncia/FotosPicker.tsx:12-76).
- **Função:** `selectImage`, aproximadamente 23-45, permite câmera ou galeria e limita o array a quatro imagens.

### [x] CRUD de denúncias: criação

- **Status:** Feito
- **Evidência:** validação e envio em [mobile/src/hooks/useDenunciaForm.ts](./src/hooks/useDenunciaForm.ts:39-80), estado/API em [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:108-124) e endpoint em [mobile/src/services/denunciaService.ts](./src/services/denunciaService.ts:57-65).
- **Função:** `submit` cria a ocorrência com tipo, bairro, descrição, identificação, data e imagens.

### [x] CRUD de denúncias: pesquisa

- **Status:** Feito
- **Evidência:** a busca é local em [mobile/src/screens/routes/gestor/DenunciasScreen.tsx](./src/screens/routes/gestor/DenunciasScreen.tsx:55-62) e [mobile/src/screens/routes/denunciante/MinhasDenunciasScreen.tsx](./src/screens/routes/denunciante/MinhasDenunciasScreen.tsx:34-44).
- **Observação:** existe pesquisa no app, mas não é um serviço CRUD separado no backend.

### [x] CRUD de denúncias: atualização

- **Status:** Feito
- **Evidência:** [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:126-146) chama `denunciasAPI.update`; [mobile/src/screens/routes/gestor/DenunciasScreen.tsx](./src/screens/routes/gestor/DenunciasScreen.tsx:64-84) atualiza status; o backend expõe `PATCH /denuncias/:id` em [backend/src/routes/denuncia.routes.ts](../backend/src/routes/denuncia.routes.ts:15).

### [ ] CRUD de denúncias: remoção

- **Status:** Parcial
- **Evidência:** `deleteDenuncia` existe em [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:155-163) e `DELETE /denuncias/:id` em [mobile/src/services/denunciaService.ts](./src/services/denunciaService.ts:73-75). O backend também expõe a rota em [backend/src/routes/denuncia.routes.ts](../backend/src/routes/denuncia.routes.ts:16).
- **O que falta:** não foi encontrado acionamento dessa operação na tela ativa. Falta uma ação de interface para excluir uma denúncia.

### [x] Listagem em FlatList

- **Status:** Feito
- **Evidência:** `FlatList` em [mobile/src/screens/routes/gestor/DenunciasScreen.tsx](./src/screens/routes/gestor/DenunciasScreen.tsx:137-151) e [mobile/src/screens/routes/denunciante/MinhasDenunciasScreen.tsx](./src/screens/routes/denunciante/MinhasDenunciasScreen.tsx:108-137).

### [ ] SectionList

- **Status:** Não feito
- **O que falta:** não foi encontrada implementação de `SectionList`; `FlatList` atende uma das opções previstas no acompanhamento.

---

## Acompanhamento 02/10 - Navegação e estado

### [x] Navegação com Expo Router

- **Status:** Feito
- **Evidência:** layouts raiz em [mobile/app/_layout.tsx](./app/_layout.tsx:1-24), público em [mobile/app/(public)/_layout.tsx](./app/%28public%29/_layout.tsx:1-15), denunciante em [mobile/app/(denunciante)/_layout.tsx](./app/%28denunciante%29/_layout.tsx:1-57) e gestor em [mobile/app/(gestor)/_layout.tsx](./app/%28gestor%29/_layout.tsx:1-57).

### [x] Rotas por perfil

- **Status:** Feito
- **Evidência:** [mobile/src/hooks/useRoleGuard.ts](./src/hooks/useRoleGuard.ts:1-23), usado pelos três layouts de grupo. Não autenticado vai para `/login`; gestor vai para `/denuncias`; cidadão vai para `/home`.
- **Observação:** esta é uma guarda de navegação no cliente; autorização real permanece no backend.

### [x] Persistência de estado com useState

- **Status:** Feito
- **Evidência:** formulários em [mobile/src/screens/routes/public/LoginScreen.tsx](./src/screens/routes/public/LoginScreen.tsx:18-38), [mobile/src/screens/routes/public/RegisterScreen.tsx](./src/screens/routes/public/RegisterScreen.tsx:20-45) e [mobile/src/hooks/useDenunciaForm.ts](./src/hooks/useDenunciaForm.ts:8-22).

### [x] Sincronização com useEffect

- **Status:** Feito
- **Evidência:** carregamento inicial em [mobile/src/screens/routes/denunciante/HomeScreen.tsx](./src/screens/routes/denunciante/HomeScreen.tsx:27-29), [mobile/src/screens/routes/denunciante/MinhasDenunciasScreen.tsx](./src/screens/routes/denunciante/MinhasDenunciasScreen.tsx:30-33), [mobile/src/screens/routes/gestor/DenunciasScreen.tsx](./src/screens/routes/gestor/DenunciasScreen.tsx:49-50) e [mobile/src/screens/routes/gestor/MapaScreen.tsx](./src/screens/routes/gestor/MapaScreen.tsx:55-57).

---

## Acompanhamento 13/11 - Segurança, painel, filtros e notificações

### [x] Registro de notificações

- **Status:** Feito
- **Evidência local:** [mobile/src/services/notifications.ts](./src/services/notifications.ts:18-33) pede permissão e cria canal Android; [mobile/src/hooks/useRegistroNotificacoes.ts](./src/hooks/useRegistroNotificacoes.ts:1-7) executa o registro na inicialização.

### [x] Acompanhamento e notificação de mudança de status

- **Status:** Parcial
- **Evidência:** `notificarMudancaStatus` agenda uma notificação local em [mobile/src/services/notifications.ts](./src/services/notifications.ts:36-49); a store chama essa função ao atualizar ou ao detectar mudança em dados recarregados em [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:71-78) e [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:126-136).
- **O que falta:** não há push remoto, registro de Push Token, backend de envio ou entrega a outro dispositivo. “Acompanhamento” existe na tela de detalhes, mas a versão do fluxo analisado não usa push.

### [ ] Notificação remota integrada ao fluxo

- **Status:** Não feito
- **Evidência:** não existe registro de Expo Push Token, endpoint de push ou envio no backend. [mobile/src/services/notifications.ts](./src/services/notifications.ts:38-49) usa `scheduleNotificationAsync`, que é local.

### [x] Segurança no app

- **Status:** Feito
- **Evidência:** token em SecureStore em [mobile/src/store/useAuthStore.ts](./src/store/useAuthStore.ts:47-48), remoção no logout em [mobile/src/store/useAuthStore.ts](./src/store/useAuthStore.ts:69-70) e header Bearer em [mobile/src/services/http.ts](./src/services/http.ts:12-24).

### [x] Barreira real no servidor

- **Status:** Feito
- **Evidência:** autenticação em [backend/src/middlewares/auth.middleware.ts](../backend/src/middlewares/auth.middleware.ts:5-22) e autorização por perfil em [backend/src/middlewares/authorize.middleware.ts](../backend/src/middlewares/authorize.middleware.ts:3-13).

### [x] Painel do gestor: total

- **Status:** Feito
- **Evidência:** `contarDenuncias` em [mobile/src/utils/metricas.ts](./src/utils/metricas.ts:8-10) e uso no dashboard em [mobile/src/screens/routes/gestor/DashboardScreen.tsx](./src/screens/routes/gestor/DashboardScreen.tsx:58-65).

### [x] Painel do gestor: distribuição por categoria

- **Status:** Feito
- **Evidência:** `contarPorTipo` em [mobile/src/utils/metricas.ts](./src/utils/metricas.ts:27-36), componente em [mobile/src/components/denuncia/DistribuicaoPorTipo.tsx](./src/components/denuncia/DistribuicaoPorTipo.tsx:12-31) e composição em [mobile/src/screens/routes/gestor/DashboardScreen.tsx](./src/screens/routes/gestor/DashboardScreen.tsx:66-68).

### [x] Painel do gestor: tempo médio

- **Status:** Feito
- **Evidência:** `calcularTempoMedioAtendimentoHoras` em [mobile/src/utils/metricas.ts](./src/utils/metricas.ts:38-52), com o número de horas convertido para dias/horas no dashboard em [mobile/src/screens/routes/gestor/DashboardScreen.tsx](./src/screens/routes/gestor/DashboardScreen.tsx:59-60).

### [x] Filtros por tipo, região e status no app

- **Status:** Feito
- **Evidência:** [mobile/src/components/denuncia/FiltroBar.tsx](./src/components/denuncia/FiltroBar.tsx:44-66) oferece status, tipo e região; [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:38-41) mantém os filtros e dispara o recarregamento.

### [x] Filtros por tipo, região e status integrados à API

- **Status:** Feito
- **Evidência:** os parâmetros são montados em [mobile/src/services/denunciaService.ts](./src/services/denunciaService.ts:24-39) e aplicados à consulta e à contagem em [backend/src/controllers/denuncia.controller.ts](../backend/src/controllers/denuncia.controller.ts:6-27), [backend/src/services/denuncia.service.ts](../backend/src/services/denuncia.service.ts:34-55) e [backend/src/repositories/denuncia.repository.ts](../backend/src/repositories/denuncia.repository.ts:10-29). O cache diferencia cada combinação de filtros.

### [x] EAS configurado

- **Status:** Parcial
- **Evidência:** [mobile/eas.json](./eas.json:1-36) define profiles `development`, `preview` e `production`; [mobile/app.json](./app.json:60-65) informa o `projectId`.
- **O que falta:** não há evidência neste repositório de build concluído ou artefato publicado. Configuração não equivale a primeiro build realizado.

### [ ] Primeiro build do EAS

- **Status:** Não feito
- **Evidência:** não existe registro, artefato ou histórico de build versionado no repositório.
- **O que falta:** executar `eas build -p android --profile preview` e publicar o link/APK para comprovação.

---

## Acompanhamento 20/11 - Atualizações, offline e revisão

### [ ] Atualizações OTA com expo-updates

- **Status:** Não feito
- **Evidência:** [mobile/app.json](./app.json:20-22) declara `"updates": { "enabled": false }`. Não foi encontrada a dependência `expo-updates` no [mobile/package.json](./package.json).
- **O que falta:** habilitar updates, instalar/configurar `expo-updates` e executar publicação para um canal EAS.

### [ ] Modo offline básico

- **Status:** Não feito
- **Evidência:** não foi encontrada persistência de lista de denúncias ou fila de criação offline.
- **O que falta:** detectar ausência de rede, persistir dados essenciais no AsyncStorage e definir a sincronização quando voltar a conexão.

### [ ] Cache com AsyncStorage

- **Status:** Parcial
- **Evidência:** `@react-native-async-storage/async-storage` persiste o Zustand da autenticação em [mobile/src/store/useAuthStore.ts](./src/store/useAuthStore.ts:75-82). Esse cache grava `user` e `isAuthenticated`, mas não grava cache de conteúdo da API.
- **O que falta:** cache de listas, denúncia selecionada ou fila offline. Não confundir persistência da sessão com cache offline de dados.

### [x] Estados de loading

- **Status:** Feito
- **Evidência:** componentes em [mobile/src/components/feedback/LoadingState.tsx](./src/components/feedback/LoadingState.tsx), estados da store em [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:27-33) e uso nas telas de denúncia e mapa.

### [x] Estados vazios e erros

- **Status:** Feito
- **Evidência:** [mobile/src/components/feedback/EmptyState.tsx](./src/components/feedback/EmptyState.tsx), [mobile/src/components/feedback/ErrorState.tsx](./src/components/feedback/ErrorState.tsx) e uso em telas de gestor e denunciante.

### [x] Validação de formulários

- **Status:** Feito
- **Evidência:** login em [mobile/src/screens/routes/public/LoginScreen.tsx](./src/screens/routes/public/LoginScreen.tsx:29-35), cadastro em [mobile/src/screens/routes/public/RegisterScreen.tsx](./src/screens/routes/public/RegisterScreen.tsx:37-51) e denúncia em [mobile/src/hooks/useDenunciaForm.ts](./src/hooks/useDenunciaForm.ts:39-47).
- **Regras comprovadas:** bairro obrigatório e descrição com pelo menos 10 caracteres no formulário atual; as regras antigas de 20 caracteres não são usadas pelo fluxo ativo.

### [x] Tratamento de erros da API

- **Status:** Feito
- **Evidência:** normalização de erro em [mobile/src/services/http.ts](./src/services/http.ts:26-36), `error` na store em [mobile/src/store/useDenunciasStore.ts](./src/store/useDenunciasStore.ts:90-104) e componentes `ErrorState` nas telas.

### [x] Revisão da arquitetura sem duplicação

- **Status:** Feito
- **Evidência positiva:** utilitários, componentes reutilizáveis, hooks e constants foram extraídos; a configuração de status, tipos e bairro está centralizada em `src/constants`.
- **Evidência:** a cópia `mobile/mobile/` e os arquivos não utilizados da arquitetura antiga (`src/models/`, `src/navigation/`, `src/viewmodels/`, telas antigas e `App.tsx`) foram removidos. O fluxo mantido é o Expo Router em `mobile/app/`, com telas em `mobile/src/screens/routes/`. A API também não mantém wrappers de serviço duplicados: stores usam os clientes em `src/services/`.

### [x] TypeScript do projeto

- **Status:** Feito
- **Evidência:** `npx tsc --noEmit` foi executado na raiz ativa `mobile/` e passou nesta revisão.

### [x] Instruções para executar no Expo Go

- **Status:** Feito
- **Evidência:** o comando `npm run start:go` inicia o Metro em modo Expo Go pela rede local; as instruções para configurar `EXPO_PUBLIC_API_URL` em celular físico estão em [mobile/README.md](./README.md).
