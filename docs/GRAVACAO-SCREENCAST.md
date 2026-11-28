# Roteiro de screencast — S.O.S. Cidade Mobile

Este guia descreve como preparar e gravar uma demonstração reproduzível do aplicativo mobile presente neste repositório. O objetivo é registrar a execução real, sem simular resultados ou apresentar como concluído um recurso que o código atual não implementa.

## 1. O que preparar antes de gravar

1. Atualize a cópia local com o conteúdo deste repositório e instale as dependências de `mobile/`.
2. Confirme que a API e o banco estão acessíveis. Para ambiente local, na raiz:

   ```bash
   docker compose up --build -d db redis api
   ```

3. Verifique a API em `http://localhost:8000/health` e a documentação em `http://localhost:8000/api-docs`.
4. Para celular físico, configure `mobile/.env` com `EXPO_PUBLIC_API_URL=http://IPV4_DO_COMPUTADOR:8000`. Computador e celular devem estar na mesma rede e a porta 8000 precisa estar liberada.
5. Para emulador Android, use `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000`.
6. Faça login previamente com as contas seed locais documentadas em [mobile/README.md](../mobile/README.md). Use somente dados fictícios.
7. Prepare uma imagem de teste que não contenha rosto, endereço residencial, placa ou informação pessoal.
8. Confirme permissões de câmera, galeria e localização no aparelho.
9. Se a gravação for da versão instalada, gere o APK com o perfil `preview` descrito no README mobile e instale exatamente esse arquivo antes de gravar.

## 2. Como gravar a tela

### Android físico

- Abra as Configurações rápidas e selecione **Gravador de tela**.
- Ative a captura de áudio do dispositivo/microfone apenas se a narração for necessária.
- Ative o modo Não perturbe para evitar que mensagens pessoais apareçam na gravação.
- Inicie a gravação antes de abrir o app e pare somente depois da tela final.
- Revise o MP4 inteiro para confirmar legibilidade, áudio e ausência de dados pessoais.

### Emulador Android

- Use o gravador de tela do Android Studio/Emulator, ou grave a janela do emulador com uma ferramenta de captura de desktop.
- Mantenha a resolução e escala constantes durante a demonstração.
- Não grave o terminal com tokens, senhas de produção ou variáveis secretas visíveis.

## 3. Sequência sugerida (5 a 7 minutos)

| Etapa | O que mostrar | O que deve ficar visível |
|---|---|---|
| 1. Abertura | Tela inicial do S.O.S. Cidade | Nome do aplicativo e navegação pública |
| 2. Cadastro/login | Tela de cadastro ou login e aceite dos documentos legais | Campos, validações e entrada na conta de denunciante |
| 3. Nova denúncia | Escolher tipo, bairro e descrição; selecionar anonimato ou identificação | Formulário preenchido com dados fictícios |
| 4. Foto | Abrir câmera ou galeria e anexar uma imagem de teste | Miniatura anexada ao formulário |
| 5. Localização | Acionar o ícone de localização e conceder permissão | Bairro sugerido/preenchido a partir da localização do aparelho |
| 6. Envio | Enviar a denúncia | Confirmação e número de protocolo retornado |
| 7. Acompanhamento | Abrir Minhas Denúncias, pesquisar/filtrar e abrir detalhes | Registro criado, protocolo, descrição, bairro, imagem e situação |
| 8. Gestão | Encerrar a sessão do denunciante, entrar como gestor e localizar a ocorrência | Lista do gestor, busca/filtros e detalhe da denúncia |
| 9. Atualização | Alterar a situação usando as opções disponíveis e salvar | Mensagem de sucesso e situação atualizada |
| 10. Retorno ao cidadão | Entrar novamente como denunciante e atualizar a lista | Situação retornada pela API e, quando a lógica local detectar a mudança, notificação local |

Use uma ocorrência criada durante a própria gravação sempre que possível. Se precisar preparar os dados antes, explique que são dados de demonstração e não apresente-os como uma nova ocorrência criada ao vivo.

## 4. Limites que devem ser narrados corretamente

- **Localização:** a implementação solicita localização em primeiro plano, faz geocodificação reversa e usa o resultado para sugerir/preencher o bairro. O formulário atual não exibe nem envia latitude/longitude explícitas. Portanto, demonstre o preenchimento do bairro, sem afirmar que coordenadas GPS foram armazenadas na denúncia.
- **Imagens:** a tela permite câmera ou galeria e limita o anexo a quatro imagens. A implementação converte a imagem para Base64 antes do envio.
- **Notificações:** a implementação atual agenda uma notificação local no dispositivo quando a store detecta alteração de situação durante a atualização da lista. Não existe neste checkout um fluxo comprovado de push remoto enviado pelo servidor a um aparelho fechado. Não descreva esse comportamento como push remoto.
- **Atualização de situação:** mostre a resposta real da API e o valor atualizado na tela. Se a atualização falhar, registre a falha e não edite o vídeo para sugerir sucesso.

Se algum desses passos não funcionar no aparelho usado, não esconda a falha: registre-a como limitação e anote modelo do aparelho, versão Android/iOS, versão do app e horário do teste.

## 5. Narração sugerida

1. “Este é o aplicativo S.O.S. Cidade, usado para registrar e acompanhar ocorrências urbanas.”
2. “O cidadão entra ou cria uma conta e concorda com os documentos legais apresentados.”
3. “No formulário, seleciona o tipo, informa bairro e descrição, escolhe se deseja se identificar e pode anexar fotos.”
4. “O botão de localização usa a localização atual para sugerir o bairro, que pode também ser escolhido manualmente.”
5. “Após enviar, o aplicativo apresenta o protocolo para acompanhamento.”
6. “Na área do cidadão, é possível consultar as próprias denúncias, pesquisar e filtrar os registros.”
7. “O gestor acessa a lista de ocorrências permitidas ao seu perfil e pode atualizar a situação.”
8. “Ao atualizar a lista do cidadão, o aplicativo reflete o estado retornado pela API; a notificação disponível nesta versão é local.”

## 6. Nome e armazenamento do vídeo

Sugestão de nome: `sos-cidade-screencast-mobile-AAAA-MM-DD.mp4`.

Guarde o arquivo em uma pasta de entrega ou em armazenamento compartilhado com permissão de visualização. Se o tamanho exceder o limite do Git, mantenha o vídeo fora do repositório e adicione no README um link de acesso testado. Não invente links nem inclua credenciais no vídeo.

## 7. Checklist antes de entregar

- [ ] O vídeo mostra o aplicativo real, não apenas telas estáticas.
- [ ] A gravação mostra cadastro/login, criação, imagem, localização, protocolo, consulta e gestão.
- [ ] O protocolo demonstrado corresponde a uma denúncia existente na API.
- [ ] A situação alterada pelo gestor aparece atualizada ao cidadão.
- [ ] A explicação sobre bairro/GPS e notificação local corresponde ao código atual.
- [ ] Não aparecem senhas, tokens, dados pessoais ou notificações particulares.
- [ ] O MP4 foi reproduzido do começo ao fim e o áudio está inteligível.
- [ ] Se foi usado APK, o vídeo foi gravado com o APK instalado, e não apenas com Expo Go.
