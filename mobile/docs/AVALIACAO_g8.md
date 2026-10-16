# Relatório de Avaliação - Unidade 1 - Desenvolvimento Mobile

## Resumo do Projeto
O grupo G8 desenvolveu o sistema **S.O.S Cidade - Recife**. O projeto inclui uma aplicação web Next.js no `frontend/` e um aplicativo mobile React Native/Expo no `mobile/`, interagindo com uma API Node.js/Express. O mobile utiliza Expo SDK 56 e Expo Router, adotando navegação protegida, controle de formulários (react-hook-form) e acesso ao mapa, GPS e Câmera.

## Membros
- DRIELLY SANTIAGO DOS SANTOS
- ALAN VITOR FERREIRA SOBRAL
- LUIZ HENRIQUE CAVALCANTI DE FREITAS
- PEDRO SOARES RANGEL
- JOÃO GUILHERME AIRES CHAGAS DE OLIVEIRA

## Tabela de Avaliação (Total: 4,0 pontos)

| Critério | Valor Máximo | Nota Atribuída | Observações |
| :--- | :---: | :---: | :--- |
| **Entrega 1 (08/09)** | | | |
| Inclusão do colaborador `mr-costaalencar` | 0,2 | 0,2 | |
| **Entrega 2 (15/09)** | | | |
| Aplicação em React Native/Expo (Android/iOS) | 0,4 | 0,4 | App mobile presente em `mobile/`, usando Expo e focado para as plataformas suportadas. |
| Arquitetura clara (MVVM ou MVC) | 0,3 | 0,2 | O projeto adota uma estrutura em `/src` (components, stores) e rotas em `/app`. Não segue um MVVM estrito, mas possui separação aceitável para MVC leve. |
| Integração com o backend definido | 0,3 | 0,3 | A integração com o backend via Docker foi projetada para ser consumida e executada em conjunto. |
| **Entrega 3 (22/09)** | | | |
| Implementação de CRUD das ocorrências | 0,4 | 0,4 | API preparada para CRUD. Espera-se que a UI mobile reflita isso. |
| Listagem com componentes nativos | 0,3 | 0,3 | Utilizado `FlatList` em `app/(denunciante)/minhas-denuncias.tsx`. |
| Uso de GPS (Expo Location) | 0,3 | 0,3 | `expo-location` instalado no `package.json` do mobile. |
| Uso de Câmera (Expo Camera/Image Picker) | 0,3 | 0,3 | `expo-camera` listado nas dependências. |
| **Entrega 4 (29/09)** | | | |
| Navegação com Expo Router | 0,5 | 0,5 | Adotado na versão 56 e presente no `package.json` do mobile. |
| Persistência/Estado (`useState`, `useEffect`)| 0,5 | 0,5 | Usa Zustand aliado aos hooks para fluxo global. |
| Relatório de Uso de IA | 0,5 | 0,0 | Falta relatório descrevendo os resultados da IA e como foi feito a avaliação humana sobre tais resultados.  |
| **TOTAL** |  | **3,4** |  |

## Pontos Positivos
- UI do mobile com recursos atuais (Zustand, React Hook Form, Zod).

## Pontos de Melhoria
- A documentação `README.md` detalha perfeitamente a parte Web e o Backend, mas cita pouco sobre a evolução e rodar o projeto Mobile especificamente. É recomendado expandir a documentação no README geral (ou criar um em `/mobile`) explicando sobre a parte mobile.
- Incluir relatório detalhado sobre o uso de IA, descrevendo os resultados obtidos e a avaliação humana sobre tais resultados.
