-- SQL SCHEMA FOR SHARED EXPENSES ENGINE (TRICOUNT STYLE)
-- Execute this in your Supabase SQL Editor

-- 0. Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table for Groups
CREATE TABLE IF NOT EXISTS split_grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    share_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table for Participants (Members of a group)
CREATE TABLE IF NOT EXISTS split_participantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES split_grupos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table for Expenses
CREATE TABLE IF NOT EXISTS split_gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES split_grupos(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    pagado_por_id UUID REFERENCES split_participantes(id) ON DELETE CASCADE,
    fecha TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table for Settlements (Payments between friends)
CREATE TABLE IF NOT EXISTS split_liquidaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES split_grupos(id) ON DELETE CASCADE,
    deudor_id UUID REFERENCES split_participantes(id) ON DELETE CASCADE,
    acreedor_id UUID REFERENCES split_participantes(id) ON DELETE CASCADE,
    monto DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES (Security)

ALTER TABLE split_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_liquidaciones ENABLE ROW LEVEL SECURITY;

-- Groups Policies
DROP POLICY IF EXISTS "Users can view their own groups" ON split_grupos;
CREATE POLICY "Users can view their own groups" ON split_grupos
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view groups via share_token" ON split_grupos;
CREATE POLICY "Anyone can view groups via share_token" ON split_grupos
    FOR SELECT USING (true); -- Public access allowed, filtered by token in app

DROP POLICY IF EXISTS "Users can insert their own groups" ON split_grupos;
CREATE POLICY "Users can insert their own groups" ON split_grupos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own groups" ON split_grupos;
CREATE POLICY "Users can update their own groups" ON split_grupos
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own groups" ON split_grupos;
CREATE POLICY "Users can delete their own groups" ON split_grupos
    FOR DELETE USING (auth.uid() = user_id);

-- Participants Policies
DROP POLICY IF EXISTS "Participants viewable by anyone in the group" ON split_participantes;
DROP POLICY IF EXISTS "Anyone can view participants" ON split_participantes;
CREATE POLICY "Anyone can view participants" ON split_participantes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage participants" ON split_participantes;
DROP POLICY IF EXISTS "Group owners can manage participants" ON split_participantes;
CREATE POLICY "Group owners can manage participants" ON split_participantes
    FOR ALL USING (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    )
    WITH CHECK (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    );

-- Expenses Policies
DROP POLICY IF EXISTS "Expenses viewable by anyone in the group" ON split_gastos;
DROP POLICY IF EXISTS "Anyone can view expenses" ON split_gastos;
CREATE POLICY "Anyone can view expenses" ON split_gastos
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage expenses" ON split_gastos;
DROP POLICY IF EXISTS "Group owners can manage expenses" ON split_gastos;
CREATE POLICY "Group owners can manage expenses" ON split_gastos
    FOR ALL USING (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    )
    WITH CHECK (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    );

-- Settlements Policies
DROP POLICY IF EXISTS "Settlements viewable by anyone in the group" ON split_liquidaciones;
DROP POLICY IF EXISTS "Anyone can view settlements" ON split_liquidaciones;
CREATE POLICY "Anyone can view settlements" ON split_liquidaciones
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage settlements" ON split_liquidaciones;
DROP POLICY IF EXISTS "Group owners can manage settlements" ON split_liquidaciones;
CREATE POLICY "Group owners can manage settlements" ON split_liquidaciones
    FOR ALL USING (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    )
    WITH CHECK (
        grupo_id IN (SELECT id FROM split_grupos WHERE user_id = auth.uid())
    );
