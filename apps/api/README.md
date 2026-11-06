# Verdantis API

API REST em Go: só biblioteca padrão para HTTP (`net/http` com rotas do Go 1.22+), `pgx` para PostgreSQL, `golang-jwt` para tokens e `bcrypt` para senhas.

## Organização

```
cmd/api/              ponto de entrada: config, banco, injeção de dependências, shutdown gracioso
internal/
  config/             variáveis de ambiente e validação
  database/           pool do Postgres e migrations SQL embutidas no binário
  apperr/             erros de domínio (inválido, não encontrado, conflito, não autorizado)
  httpx/              JSON, mapeamento de erro → status HTTP, middlewares (log, recover, CORS)
  auth/               emissão/validação de JWT, middleware de autenticação, bcrypt
  traceability/       cadeia de hashes SHA-256 e assinatura Ed25519 (funções puras)
  user/               cadastro, login e perfil
  lote/               lotes, eventos, finalização, verificação pública e indicadores
  server/             registro das rotas
```

Cada domínio (`user`, `lote`) segue o mesmo formato: `handler.go` (HTTP e DTOs), `service.go` (regras), `repository.go` (SQL). O serviço depende de uma interface `Repository`, o que permite testar as regras com um repositório em memória.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | obrigatória | URL do PostgreSQL |
| `JWT_SECRET` | obrigatória | Pelo menos 32 caracteres |
| `JWT_TTL` | `24h` | Validade do token |
| `HTTP_ADDR` | `:8080` | Endereço do servidor |
| `CORS_ORIGINS` | `http://localhost:3000` | Origens permitidas, separadas por vírgula |
| `PUBLIC_WEB_URL` | `http://localhost:3000` | Base do link de verificação no QR Code |
| `SIGNING_KEY_SEED` | vazio | 32 bytes em base64; obrigatória com `APP_ENV=production` |
| `APP_ENV` | `development` | `production` exige chave de assinatura fixa |

## Endpoints

Rotas autenticadas exigem `Authorization: Bearer <token>`. Erros seguem o formato `{"message": "...", "fields": {"campo": "motivo"}}`.

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| GET | `/healthz` | não | Saúde da API e do banco |
| POST | `/api/auth/register` | não | `{nomeCompleto, email, cpf, senha}` → token |
| POST | `/api/auth/login` | não | `{email, senha}` → token |
| GET | `/api/me` | sim | Dados do usuário (CPF mascarado) |
| GET | `/api/lotes` | sim | Lotes do usuário |
| POST | `/api/lotes` | sim | Cria lote |
| GET | `/api/lotes/{id}` | sim | Detalhe |
| PUT | `/api/lotes/{id}` | sim | Atualiza; lote finalizado só aceita mudanças financeiras |
| DELETE | `/api/lotes/{id}` | sim | Remove |
| GET | `/api/lotes/{id}/eventos` | sim | Eventos em ordem, com hashes |
| POST | `/api/lotes/{id}/eventos` | sim | `{tipoEvento, descricao}` |
| POST | `/api/lotes/{id}/finalizar` | sim | Sela a cadeia e devolve o certificado |
| GET | `/api/dashboard` | sim | Totais de receita, custo e lucro |
| GET | `/api/analytics/tendencia-lucro` | sim | Receita, custo e lucro por mês |
| GET | `/api/public/verificacao/{codigo}` | não | Certificado, eventos e resultado da verificação |
| GET | `/api/public/verificacao/{codigo}/qrcode.png` | não | QR Code para a página pública |

Tipos de evento: `SOIL_PREPARATION`, `INPUT_ADDITION`, `FERTILIZATION`, `PEST_CONTROL`, `IRRIGATION`, `PRUNING`, `INSPECTION`, `HARVEST`, `OTHER`.

## Cadeia de eventos

```
hash_n = SHA256("v1" \n lote_id \n seq \n tipo \n descricao \n ocorrido_em \n hash_{n-1})
hash_0 = SHA256("verdantis:v1:genesis:<lote_id>")
```

Os eventos são gravados numa transação que trava a linha do lote (`SELECT ... FOR UPDATE`), então duas requisições simultâneas não bifurcam a cadeia. Ao finalizar, a API assina `verdantis:v1:certificate:<codigo>:<hash_final>` com Ed25519.

## Testes

```bash
go test ./...
```

Sem Go instalado, dá para rodar com Docker:

```bash
docker run --rm -v "$PWD":/src -w /src golang:1.26-alpine go test ./...
```
