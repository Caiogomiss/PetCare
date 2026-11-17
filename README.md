# PetCare

App de saúde e cuidados com pets: carteirinha de vacinas e consultas, lembretes, serviços e campanhas por perto, alertas comunitários e orientações.

Projeto Integrado de Gestão de Sistemas de Informação (Uniceplac).

## Stack

- React Native + Expo (JavaScript)
- React Navigation (abas + telas empilhadas)
- Supabase (banco PostgreSQL + login com e-mail e senha + fotos)
- expo-location (serviços perto de você), expo-notifications (lembretes), expo-image-picker (fotos)
- Mapa com OpenStreetMap/Leaflet dentro de uma WebView (não precisa de chave do Google)

## Rodar no celular

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go**. Sem configurar nada, o app abre em **modo local**: tudo fica salvo no próprio aparelho.

## Ligar o Supabase

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, rode `supabase/schema.sql` e depois `supabase/seed.sql`. Os dois podem ser rodados de novo sem apagar dados.
3. Em **Authentication > Sign In / Providers > Email**, desligue **Confirm email** (assim o cadastro entra direto, sem precisar abrir e-mail). Se deixar ligado, o app avisa para confirmar o e-mail antes do login.
4. Em **Authentication > URL Configuration**, coloque o endereço do site (`https://caiogomiss.github.io/PetCare/`) em **Site URL** e em **Redirect URLs**. É para onde o link de "Esqueci minha senha" leva.
5. Copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API).
6. Reinicie o `npx expo start`.

A chave `anon` é pública. Quem protege os dados são as regras (RLS) do `schema.sql`: cada tutor só vê os próprios pets, registros e lembretes; alertas são visíveis para todos os usuários logados; serviços e orientações são só leitura. **Nunca** coloque a chave `service_role` no app.

Para cadastrar ou trocar serviços, campanhas e orientações: edite `src/data/seed.js`, rode `node scripts/gerar-seed-sql.js` e rode o `supabase/seed.sql` de novo. Também dá para editar direto no Table Editor do Supabase.

## Versão web (iPhone, Android e computador)

O app também roda no navegador e pode ser instalado na tela inicial. É o jeito mais fácil de usar no iPhone.

**Publicar (uma vez só):**
1. O dono do repositório vai em **Settings > Pages** e, em **Source**, escolhe **GitHub Actions**.
2. Faça um push na `main`. A Action `Publicar versão web` gera o site sozinha (aba **Actions**, leva uns 3 minutos).
3. O app fica em **https://caiogomiss.github.io/PetCare/**

**Instalar no iPhone:** abra o link no **Safari** > botão **Compartilhar** > **Adicionar à Tela de Início**. O PetCare vira um ícone que abre em tela cheia.

**Instalar no Android:** abra o link no Chrome > menu ⋮ > **Instalar app** (ou Adicionar à tela inicial).

Na versão web as notificações dos lembretes não aparecem; o resto funciona igual. Se o nome do repositório mudar, ajuste `experiments.baseUrl` no `app.json`.

## Gerar o APK (só Android)

O Expo Go precisa do computador e da internet ligados. O APK não: é o app instalado de verdade no celular.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile apk
```

No fim, o EAS mostra um link para baixar o `.apk`. Instale no celular (permita "instalar apps desconhecidos").

Sem internet no dia: o app abre, mostra os últimos dados carregados (com uma faixa avisando) e os lembretes continuam notificando. Cadastrar coisas novas precisa de internet. Plano B: gere um APK sem o `.env` e ele roda 100% offline em modo local.

## Estrutura

```
App.js                      fontes, AuthProvider e navegação
src/
  config.js                 chaves do Supabase (lidas do .env)
  theme.js                  cores, espaçamentos e fontes
  navigation/index.js       abas e telas
  context/AuthContext.js    login, cadastro e perfil (UC01, UC02)
  lib/
    db.js                   acesso a dados (Supabase ou local) + cache offline
    photos.js               fotos (galeria/câmera + upload)
    notifications.js        notificações dos lembretes
    location.js             GPS e regiões do DF
    format.js               datas, máscaras e validações
  constants/
    messages.js             MSG01 a MSG21 da documentação
    options.js              espécies, tipos de registro, alertas, categorias
  components/               componentes visuais reutilizados
  screens/
    auth/                   Login, Cadastro
    HomeScreen.js           Início
    services/               Serviços e detalhes (UC07)
    wallet/                 Carteirinha, pet, registros, lembretes (UC03 a UC06)
    alerts/                 Alertas comunitários (UC08)
    guides/                 Orientações (UC09)
    profile/                Perfil e dados do tutor
  data/seed.js              serviços, campanhas e orientações de exemplo
supabase/
  schema.sql                tabelas, regras de acesso e bucket de fotos
  seed.sql                  dados de exemplo (gerado)
```

## Casos de uso cobertos

| UC | Tela |
|----|------|
| UC01 Cadastro de usuário | Cadastro |
| UC02 Login | Login |
| UC03 Cadastrar pet | Carteirinha > Cadastrar pet / Perfil > Adicionar |
| UC04 Consultar e editar pet | Carteirinha > cartão do pet |
| UC05 Registros de saúde | Carteirinha > abas Vacinas, Consultas, Medicamentos, Exames, Castração |
| UC06 Lembretes | Carteirinha > Lembretes |
| UC07 Serviços e campanhas | Serviços (lista e mapa) |
| UC08 Alertas comunitários | Início > Alertas |
| UC09 Orientações | Início > Orientações |

Os locais em `src/data/seed.js` são exemplos para demonstração.
