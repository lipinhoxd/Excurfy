# Excurfy

Sua excursão, do anúncio ao embarque.

Plataforma SaaS de gestão de excursões. O excursionista cria e vende excursões, recebe por Pix e cartão, controla passageiros e financeiro e faz check-in por QR code. O viajante busca excursões, escolhe pacote e poltrona, paga e recebe um voucher com QR code.

Projeto de estudo e aprendizado.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Supabase (Postgres, autenticação e storage)
- Vercel (hospedagem)
- Asaas (pagamentos, ainda não integrado)

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha a chave publicável do Supabase
npm run dev                  # http://localhost:3000
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável (pública por design; a segurança vem das regras RLS) |

Nunca coloque a chave `service_role` ou qualquer segredo no código ou no GitHub.

## Publicar na Vercel

Importe o repositório (framework Next.js, Root Directory na raiz) e cadastre as duas variáveis acima em Settings, Environment Variables.

## Banco de dados

Mudanças no banco devem ser migrations versionadas em `supabase/migrations/`.
