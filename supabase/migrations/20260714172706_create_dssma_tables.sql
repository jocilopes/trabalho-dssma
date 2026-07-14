/*
# DSSMA Digital — Create core tables

## Overview
Creates the database schema for the DSSMA Digital system — a digital management
system for Safety, Health, and Environment Dialogues (DDS/DSSMA).

## New Tables

1. **setores** — Sectors/departments of the organization
   - `id` (uuid, PK)
   - `nome` (text, not null) — sector name
   - `responsavel` (text, nullable) — person responsible for the sector
   - `created_at` (timestamptz)

2. **temas** — Library of DDS topics/themes
   - `id` (uuid, PK)
   - `titulo` (text, not null) — topic title
   - `categoria` (text, not null) — 'seguranca' | 'saude' | 'meio_ambiente'
   - `descricao` (text, nullable) — topic description
   - `created_at` (timestamptz)

3. **dialogos** — DDS dialogue sessions
   - `id` (uuid, PK)
   - `titulo` (text, not null) — dialogue title
   - `tema` (text, not null) — the theme discussed
   - `categoria` (text, not null) — 'seguranca' | 'saude' | 'meio_ambiente'
   - `data_realizacao` (date, not null) — date of the dialogue
   - `setor` (text, not null) — sector where it was held
   - `responsavel` (text, not null) — person who conducted it
   - `duracao_minutos` (int, default 15) — duration in minutes
   - `num_participantes` (int, default 0) — number of participants
   - `observacoes` (text, nullable) — notes
   - `status` (text, not null default 'realizado') — 'realizado' | 'agendado' | 'cancelado'
   - `created_at` (timestamptz)

4. **participantes** — Participants of each dialogue
   - `id` (uuid, PK)
   - `dialogo_id` (uuid, FK → dialogos.id ON DELETE CASCADE)
   - `nome` (text, not null) — participant name
   - `matricula` (text, nullable) — employee registration number
   - `setor` (text, nullable) — participant's sector
   - `assinatura` (boolean, default false) — whether they signed attendance
   - `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- Single-tenant app (no auth) — policies use `TO anon, authenticated` with `USING (true)`
  because all data is intentionally shared/public within the organization.
*/

-- Setores
CREATE TABLE IF NOT EXISTS setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  responsavel text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_setores" ON setores;
CREATE POLICY "anon_select_setores" ON setores FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_setores" ON setores;
CREATE POLICY "anon_insert_setores" ON setores FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_setores" ON setores;
CREATE POLICY "anon_update_setores" ON setores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_setores" ON setores;
CREATE POLICY "anon_delete_setores" ON setores FOR DELETE
  TO anon, authenticated USING (true);

-- Temas
CREATE TABLE IF NOT EXISTS temas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('seguranca', 'saude', 'meio_ambiente')),
  descricao text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_temas" ON temas;
CREATE POLICY "anon_select_temas" ON temas FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_temas" ON temas;
CREATE POLICY "anon_insert_temas" ON temas FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_temas" ON temas;
CREATE POLICY "anon_update_temas" ON temas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_temas" ON temas;
CREATE POLICY "anon_delete_temas" ON temas FOR DELETE
  TO anon, authenticated USING (true);

-- Dialogos
CREATE TABLE IF NOT EXISTS dialogos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tema text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('seguranca', 'saude', 'meio_ambiente')),
  data_realizacao date NOT NULL,
  setor text NOT NULL,
  responsavel text NOT NULL,
  duracao_minutos int NOT NULL DEFAULT 15,
  num_participantes int NOT NULL DEFAULT 0,
  observacoes text,
  status text NOT NULL DEFAULT 'realizado' CHECK (status IN ('realizado', 'agendado', 'cancelado')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dialogos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_dialogos" ON dialogos;
CREATE POLICY "anon_select_dialogos" ON dialogos FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_dialogos" ON dialogos;
CREATE POLICY "anon_insert_dialogos" ON dialogos FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_dialogos" ON dialogos;
CREATE POLICY "anon_update_dialogos" ON dialogos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_dialogos" ON dialogos;
CREATE POLICY "anon_delete_dialogos" ON dialogos FOR DELETE
  TO anon, authenticated USING (true);

-- Participantes
CREATE TABLE IF NOT EXISTS participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogo_id uuid NOT NULL REFERENCES dialogos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  matricula text,
  setor text,
  assinatura boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_participantes" ON participantes;
CREATE POLICY "anon_select_participantes" ON participantes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_participantes" ON participantes;
CREATE POLICY "anon_insert_participantes" ON participantes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_participantes" ON participantes;
CREATE POLICY "anon_update_participantes" ON participantes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_participantes" ON participantes;
CREATE POLICY "anon_delete_participantes" ON participantes FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dialogos_data ON dialogos(data_realizacao DESC);
CREATE INDEX IF NOT EXISTS idx_dialogos_categoria ON dialogos(categoria);
CREATE INDEX IF NOT EXISTS idx_dialogos_status ON dialogos(status);
CREATE INDEX IF NOT EXISTS idx_participantes_dialogo ON participantes(dialogo_id);
CREATE INDEX IF NOT EXISTS idx_temas_categoria ON temas(categoria);
