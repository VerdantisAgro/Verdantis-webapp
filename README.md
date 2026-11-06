# Verdantis

Caderno de campo digital para o pequeno e médio produtor rural: registre lotes, custos e eventos do cultivo, veja o lucro real de cada lote e gere um certificado de origem verificável.

## Estrutura

Monorepo com dois projetos:

```
.
├── apps/
│   ├── web/   # Front-end Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui)
│   └── api/   # Back-end em Go (REST, PostgreSQL)
└── README.md
```

## Front-end (`apps/web`)

```bash
cd apps/web
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

Variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base da API |
