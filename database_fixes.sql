-- SCRIPT DE INTEGRIDAD DE DATOS PARA SUPABASE
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase

-- 1. Función para recalcular el saldo de una cuenta basada en sus transacciones
CREATE OR REPLACE FUNCTION recalcular_saldo_cuenta(p_cuenta_id UUID)
RETURNS VOID AS $$
DECLARE
    v_tipo_cuenta TEXT;
    v_total_ingresos DECIMAL := 0;
    v_total_gastos DECIMAL := 0;
    v_total_traspasos_out DECIMAL := 0;
    v_total_traspasos_in DECIMAL := 0;
    
    -- Para inversiones
    v_capital_invertido DECIMAL := 0;
    v_precio_promedio DECIMAL := 0;
    v_total_participaciones DECIMAL := 0;
    v_precio_actual DECIMAL := 0;
BEGIN
    -- Obtener tipo de cuenta y precio actual
    SELECT tipo, precio_actual INTO v_tipo_cuenta, v_precio_actual FROM cuentas WHERE id = p_cuenta_id;

    IF v_tipo_cuenta = 'inversion' THEN
        -- Lógica de inversión: El capital invertido es la suma de montos de 'ingreso' (compras)
        -- El saldo es participaciones * precio_actual
        
        -- Sumamos capital invertido (compras)
        SELECT COALESCE(SUM(monto), 0) INTO v_capital_invertido 
        FROM transacciones 
        WHERE cuenta_id = p_cuenta_id AND tipo = 'ingreso';

        -- Calculamos participaciones: suma de (monto / precio_compra)
        SELECT COALESCE(SUM(monto / NULLIF(precio_compra, 0)), 0) INTO v_total_participaciones
        FROM transacciones 
        WHERE cuenta_id = p_cuenta_id AND tipo = 'ingreso';

        -- Precio promedio
        IF v_total_participaciones > 0 THEN
            v_precio_promedio := v_capital_invertido / v_total_participaciones;
        END IF;

        -- Actualizamos cuenta de inversión
        UPDATE cuentas SET 
            capital_invertido = v_capital_invertido,
            precio_promedio = v_precio_promedio,
            saldo = v_total_participaciones * COALESCE(v_precio_actual, v_precio_promedio)
        WHERE id = p_cuenta_id;

    ELSE
        -- Lógica de cuenta regular
        SELECT COALESCE(SUM(monto), 0) INTO v_total_ingresos FROM transacciones WHERE cuenta_id = p_cuenta_id AND tipo = 'ingreso';
        SELECT COALESCE(SUM(monto), 0) INTO v_total_gastos FROM transacciones WHERE cuenta_id = p_cuenta_id AND tipo = 'gasto';
        SELECT COALESCE(SUM(monto), 0) INTO v_total_traspasos_out FROM transacciones WHERE cuenta_id = p_cuenta_id AND tipo = 'transferencia';
        SELECT COALESCE(SUM(monto), 0) INTO v_total_traspasos_in FROM transacciones WHERE cuenta_destino_id = p_cuenta_id AND tipo = 'transferencia';

        UPDATE cuentas SET 
            saldo = v_total_ingresos - v_total_gastos - v_total_traspasos_out + v_total_traspasos_in
        WHERE id = p_cuenta_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger Function que se dispara al cambiar transacciones
CREATE OR REPLACE FUNCTION trigger_actualizar_saldos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es INSERT o UPDATE, recalculamos la cuenta origen (y destino si es transferencia)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM recalcular_saldo_cuenta(NEW.cuenta_id);
        IF NEW.tipo = 'transferencia' AND NEW.cuenta_destino_id IS NOT NULL THEN
            PERFORM recalcular_saldo_cuenta(NEW.cuenta_destino_id);
        END IF;
    END IF;

    -- Si es UPDATE o DELETE, recalculamos también las cuentas viejas por si cambiaron
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        PERFORM recalcular_saldo_cuenta(OLD.cuenta_id);
        IF OLD.tipo = 'transferencia' AND OLD.cuenta_destino_id IS NOT NULL THEN
            PERFORM recalcular_saldo_cuenta(OLD.cuenta_destino_id);
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el Trigger
DROP TRIGGER IF EXISTS trg_actualizar_saldos_on_tx ON transacciones;
CREATE TRIGGER trg_actualizar_saldos_on_tx
AFTER INSERT OR UPDATE OR DELETE ON transacciones
FOR EACH ROW EXECUTE FUNCTION trigger_actualizar_saldos();

-- 4. Ejecutar un recalculo inicial para todas las cuentas (opcional pero recomendado)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM cuentas LOOP
        PERFORM recalcular_saldo_cuenta(r.id);
    END LOOP;
END $$;
