USE [dogtor3]
GO

-- --- Configuración ---
DECLARE @StartDate DATE = GETDATE(); 
DECLARE @EndDate DATE = '2026-02-02';

-- --- Lógica del Script ---
;WITH
-- 1. CTE que genera todos los días
DateGenerator AS (
    SELECT @StartDate AS GenDate
    UNION ALL
    SELECT DATEADD(day, 1, GenDate)
    FROM DateGenerator
    WHERE GenDate < @EndDate
),

-- 2. CTE que genera todos los intervalos de 30 min
TimeGenerator AS (
    SELECT CAST('09:00:00' AS TIME(7)) AS GenTime
    UNION ALL
    SELECT DATEADD(minute, 30, GenTime)
    FROM TimeGenerator
    WHERE GenTime < '17:30:00'
),

-- 3. CTE que crea la "fuente" de todos los turnos que DEBERÍAN existir
-- Filtramos por días de semana (Lunes a Viernes)
AllPossibleSlots AS (
    SELECT
        CAST(D.GenDate AS DATETIME) AS [fecha],
        T.GenTime AS [hora],
        1 AS [cod_estado] -- El estado por defecto si se crea
    FROM
        DateGenerator AS D
    CROSS JOIN 
        TimeGenerator AS T
    WHERE
        -- Filtra para incluir SÓLO de Lunes a Viernes
        (DATEPART(DW, D.GenDate) + @@DATEFIRST - 1) % 7 NOT IN (0, 6)
)

-- 4. Ejecuta la operación MERGE
MERGE INTO [dbo].[DISPONIBILIDAD] AS T -- T = Target (Destino)
USING AllPossibleSlots AS S -- S = Source (Fuente)
    ON (T.fecha = S.fecha AND T.hora = S.hora) -- Condición de coincidencia

-- 5. ACCIÓN: Si NO existe en el Destino (Target)...
WHEN NOT MATCHED BY TARGET THEN
    INSERT ([fecha], [hora], [cod_estado])
    VALUES (S.fecha, S.hora, S.cod_estado)

-- (Omitimos 'WHEN MATCHED' a propósito para que no haga nada si ya existe)

-- 6. Opción para recursión larga
OPTION (MAXRECURSION 0);
GO

PRINT 'Operación MERGE completada. Solo se insertaron los turnos faltantes.';