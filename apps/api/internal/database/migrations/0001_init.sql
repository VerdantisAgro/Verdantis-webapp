CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    cpf           TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_key ON users (lower(email));
CREATE UNIQUE INDEX users_cpf_key ON users (cpf);

CREATE TABLE lotes (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name               TEXT           NOT NULL,
    crop               TEXT           NOT NULL,
    variety            TEXT           NOT NULL DEFAULT '',
    area_hectares      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (area_hectares >= 0),
    planting_date      DATE,
    expected_harvest   DATE,
    production_total   NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (production_total >= 0),
    cost_total         NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cost_total >= 0),
    sale_price         NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
    status             TEXT           NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado')),
    verification_code  TEXT UNIQUE,
    final_hash         TEXT,
    signature          TEXT,
    finalized_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX lotes_user_id_idx ON lotes (user_id);

-- Each event stores the hash of the previous one, forming a chain per lote.
CREATE TABLE lote_events (
    id            BIGSERIAL PRIMARY KEY,
    lote_id       BIGINT      NOT NULL REFERENCES lotes (id) ON DELETE CASCADE,
    seq           INTEGER     NOT NULL CHECK (seq > 0),
    type          TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    occurred_at   TIMESTAMPTZ NOT NULL,
    previous_hash TEXT        NOT NULL,
    hash          TEXT        NOT NULL,
    UNIQUE (lote_id, seq)
);
