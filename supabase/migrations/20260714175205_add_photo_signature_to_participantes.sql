/*
# DSSMA Digital — Add photo and signature confirmation to participantes

## Overview
Adds columns to support presence confirmation with photo and digital signature.

## Changes to participantes table
- `foto_url` (text, nullable) — URL of the participant's photo in Supabase Storage
- `assinatura_data` (timestamptz, nullable) — timestamp when presence was confirmed
- `assinatura_imagem_url` (text, nullable) — URL of the signature image in Storage

## Security
- No RLS policy changes needed (table already has authenticated-only policies).
*/

ALTER TABLE participantes
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS assinatura_data timestamptz,
  ADD COLUMN IF NOT EXISTS assinatura_imagem_url text;
