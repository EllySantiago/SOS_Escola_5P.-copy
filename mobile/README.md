# S.O.S. Cidade — aplicativo mobile

Aplicativo Android/iOS desenvolvido com Expo, React Native, TypeScript, Expo Router e NativeWind. O aplicativo utiliza a API do S.O.S. Cidade; não é um aplicativo independente nem um PWA.

## Requisitos

- Node.js compatível com a versão Expo instalada no `package.json`.
- npm.
- Docker Desktop para subir API, PostgreSQL e Redis locais.
- Expo Go para execução rápida de desenvolvimento ou EAS Build para gerar um APK instalável.

## Subir a API local

Na raiz do repositório:

```bash
docker compose up --build -d db redis api
```

Aguarde os serviços ficarem saudáveis. A API local fica em `http://localhost:8000`.

## Instalar e iniciar o aplicativo

Em outro terminal:

```bash
cd mobile
npm install
```

Crie `mobile/.env` a partir de `.env.example` e ajuste a URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Escolha o endereço conforme o dispositivo:

| Ambiente | URL da API |
|---|---|
| Android Emulator | `http://10.0.2.2:8000` |
| iOS Simulator | `http://localhost:8000` |
| Celular físico na mesma rede Wi-Fi | `http://IPV4_DO_COMPUTADOR:8000` |
| API publicada | URL HTTPS do ambiente publicado |

No celular físico, computador e aparelho precisam alcançar a mesma rede; libere a porta 8000 no firewall, se necessário. `localhost` no celular aponta para o próprio aparelho, não para o computador.

Inicie o Expo Go:

```bash
npm run start:go
```

Se a rede bloquear a conexão local, tente:

```bash
npm run start:go:tunnel
```

Para abrir o app em um emulador configurado, use `npm run android`. A opção web (`npm run web`) serve para desenvolvimento e não substitui a validação Android/iOS.

## Contas locais de demonstração

O seed local da API cria contas de teste:

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor1.teste@soscidade.com` | `Teste@123` |
| Gestor | `gestor2.teste@soscidade.com` | `Teste@123` |
| Denunciante | `denunciante.teste@soscidade.com` | `Teste@123` |

Use essas contas somente no ambiente local. Não reutilize essas credenciais em produção. Para demonstrar o cadastro, use um e-mail de teste controlado e aceite os documentos legais apresentados na tela.

## Fluxos disponíveis no aplicativo

- **Público:** tela inicial, cadastro e login, com aceite dos documentos legais.
- **Denunciante:** página inicial, criação de denúncia, seleção do tipo e bairro, descrição, data, opção de anonimato, anexos de imagem, listagem e detalhe das próprias denúncias.
- **Gestor:** dashboard, listagem e filtros, mapa, detalhe da ocorrência, atualização de situação e gestão de contas de gestor.

### Observações importantes para uma demonstração correta

- O botão de localização solicita permissão de localização em primeiro plano e usa geocodificação reversa para sugerir/preencher o bairro. O formulário atual envia o bairro; não apresenta nem envia coordenadas GPS explícitas como latitude/longitude.
- O seletor de imagens permite usar câmera ou galeria, com limite de quatro imagens por denúncia.
- As notificações implementadas são **locais**. O código compara situações quando a lista do denunciante é atualizada e agenda uma notificação no próprio dispositivo quando detecta mudança. Não há, neste checkout, comprovação de push remoto disparado pelo servidor para um aparelho fechado.
- A lista de denúncias do cidadão é obtida por endpoint autenticado; o backend deve restringir os registros de acordo com o usuário autenticado.

Não narre esses recursos como GPS com coordenadas persistidas ou push remoto. Para uma gravação fiel ao código atual, use o roteiro em [docs/GRAVACAO-SCREENCAST.md](../docs/GRAVACAO-SCREENCAST.md).

## Build Android (APK)

O arquivo `eas.json` contém perfis `development`, `preview` e `production`. O perfil `preview` está configurado para distribuição interna e geração de APK.

```bash
cd mobile
npm install -g eas-cli
eas login
npx expo-doctor
eas build --platform android --profile preview
```

Acompanhe o link de build exibido pelo EAS. Quando terminar, baixe o APK e instale-o em um dispositivo Android ou emulador. O perfil `production` está configurado para gerar Android App Bundle (`.aab`), não APK.

Antes de gerar o build, confira `EXPO_PUBLIC_API_URL` no ambiente EAS e confirme que a API HTTPS está acessível publicamente. Um APK compilado não comprova sozinho que login, câmera, localização, envio de imagens e atualização de situação funcionam; execute o roteiro de validação no dispositivo.

Guarde o APK e as informações do build em uma pasta de entrega local ou em armazenamento apropriado. Não adicione arquivos de build grandes ao Git sem necessidade.

## Testes e diagnóstico

```bash
# Dentro de mobile/
npm run test:ci
npm run test:integration:backend
npx tsc --noEmit
```

A integração HTTP exige a API e o banco de teste configurados conforme `jest.integration.config.js`. Os testes Jest não abrem emulador nem substituem teste manual em aparelho.

## Segurança e privacidade

- Android/iOS usam SecureStore para o token; o comportamento web é diferente.
- O cache local de denúncias usa AsyncStorage e não é criptografado.
- As imagens anexadas não recebem a mesma criptografia adicional aplicada a alguns campos textuais no backend.
- Consulte [avaliação de segurança e privacidade](docs/seguranca/seguranca-lgpd.md) antes de qualquer uso com dados reais.

## Documentação complementar

- [Índice da documentação mobile](docs/README.md)
- [Testes mobile](docs/testes/README.md)
- [Backlog mobile](docs/backlog/epicos-produto.md)
- [Roteiro de screencast](../docs/GRAVACAO-SCREENCAST.md)
