ALTER TABLE split_gastos ADD COLUMN IF NOT EXISTS participantes_ids JSONB DEFAULT NULL;
COMMENT ON COLUMN split_gastos.participantes_ids IS 'IDs de los participantes a los que aplica este gasto. Si es null, aplica a todos.';
