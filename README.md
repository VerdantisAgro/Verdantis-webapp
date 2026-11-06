# Verdantis

Caderno de campo digital para o pequeno e médio produtor rural: registre lotes, custos e eventos do cultivo, veja o lucro real de cada lote e gere um certificado de origem que qualquer comprador confere pelo QR Code.

## Estrutura

```
.
├── apps/
│   ├── web/              # Front-end Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui)
│   └── api/              # Back-end Go (net/http, PostgreSQL, JWT)
├── docker-compose.yml    # Postgres + API + Web
└── .env.example          # Variáveis usadas pelo compose
```

## Rodando com Docker (recomendado)

```bash
cp .env.example .env      # ajuste os segredos se quiser
docker compose up --build
```

| Serviço | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:8080 (saúde em `/healthz`) |
| PostgreSQL | apenas na rede interna do compose |

Sem `SIGNING_KEY_SEED` no `.env`, a API usa uma chave temporária: certificados emitidos deixam de validar a assinatura quando a API reinicia. Gere uma chave fixa com `openssl rand -base64 32`.

## Rodando sem Docker

API (Go 1.26+ e um PostgreSQL acessível):

```bash
cd apps/api
export DATABASE_URL="postgres://verdantis:verdantis@localhost:5432/verdantis?sslmode=disable"
export JWT_SECRET="um-segredo-com-pelo-menos-32-caracteres"
go run ./cmd/api
```

Web (Node 22 e pnpm):

```bash
cd apps/web
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:8080 pnpm dev
```

## Como a rastreabilidade funciona

Não há blockchain. Cada evento registrado guarda o hash SHA-256 do evento anterior, então alterar ou apagar um registro antigo quebra todos os seguintes. Ao finalizar o lote, a API assina o hash final com Ed25519 e gera um código de verificação. O QR Code abre `/verificar/<código>`, que recalcula a cadeia e confere a assinatura sem exigir login.

Detalhes da API em [apps/api/README.md](apps/api/README.md).

## Testes

```bash
cd apps/api && go test ./...      # regras de negócio, cadeia de hashes, auth
cd apps/web && pnpm build          # o build falha em erro de tipo
```
