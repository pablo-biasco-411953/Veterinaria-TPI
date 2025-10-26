-- 1. CREACIÓN DE LA BASE DE DATOS (si no existe)
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'dogtor')
BEGIN
    CREATE DATABASE dogtor;
END
GO

USE dogtor;
GO

-- 2. CREACIÓN DE TABLAS DE CATÁLOGO

-- TIPO_ATENCION (Tipo de Servicio)
CREATE TABLE [dbo].[TIPO_ATENCION](
	[cod_tipoA] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[cod_tipoA] ASC
)
) ON [PRIMARY]
GO

-- TIPO_MASCOTA (Tipo de animal: Perro, Gato, Ave)
CREATE TABLE [dbo].[TIPO_MASCOTA](
	[cod_tipo] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[cod_tipo] ASC
)
) ON [PRIMARY]
GO

-- DISPONIBILIDAD (Agenda de Turnos)
CREATE TABLE [dbo].[DISPONIBILIDAD](
	[cod_disponibilidad] [int] IDENTITY(1,1) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[hora] [time](7) NOT NULL,
	[ocupada] [int] NOT NULL DEFAULT 0, -- 0 = Libre, 1 = Ocupada
PRIMARY KEY CLUSTERED 
(
	[cod_disponibilidad] ASC
)
) ON [PRIMARY]
GO


-- 3. CREACIÓN DE TABLA CLIENTE (CON AUTENTICACIÓN Y APELLIDO)

-- CLIENTE (Usuarios del sistema)
CREATE TABLE [dbo].[CLIENTE](
	[cod_cliente] [int] IDENTITY(1,1) NOT NULL,
    -- Campos básicos
	[nombre] [varchar](100) NOT NULL,
	[apellido] [varchar](100) NOT NULL, -- Agregado para coincidir con el DbContext
	[telefono] [varchar](10) NOT NULL,
	[dni] [int] NOT NULL,
    -- Campos de Autenticación (hash de Password de tamaño seguro)
    [password] [varchar](150) NOT NULL, 
PRIMARY KEY CLUSTERED 
(
	[cod_cliente] ASC
),
UNIQUE NONCLUSTERED 
(
    [dni] ASC -- Asegura que el dni sea único
)
) ON [PRIMARY]
GO


-- 4. CREACIÓN DE TABLA MASCOTA

CREATE TABLE [dbo].[MASCOTA](
	[cod_mascota] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
	[edad] [int] NOT NULL,
	[cod_cliente] [int] NOT NULL,
	[cod_tipo] [int] NOT NULL,
	[eliminado] [bit] NOT NULL DEFAULT 1, -- 0 = Eliminado, 1 = Activo (Invertido según tu script original)
PRIMARY KEY CLUSTERED 
(
	[cod_mascota] ASC
)
) ON [PRIMARY]
GO


-- 5. CREACIÓN DE TABLA ATENCION (Turnos)

CREATE TABLE [dbo].[ATENCION](
	[cod_atencion] [int] IDENTITY(1,1) NOT NULL,
	[cod_disponibilidad] [int] NOT NULL,
	[cod_tipoA] [int] NOT NULL,
	[importe] [decimal](10, 2) NULL,
	[cod_mascota] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[cod_atencion] ASC
)
) ON [PRIMARY]
GO

-- 6. CREACIÓN DE TABLA DETALLE_ATENCION

CREATE TABLE [dbo].[DETALLE_ATENCION](
	[cod_detalle] [int] IDENTITY(1,1) NOT NULL,
	[cod_atencion] [int] NOT NULL,
	[cod_tipoA] [int] NOT NULL,
    [observaciones] [varchar](250) NULL, -- Campo de ejemplo para el detalle
PRIMARY KEY CLUSTERED 
(
	[cod_detalle] ASC
)
) ON [PRIMARY]
GO


-- 7. DEFINICIÓN DE CLAVES FORÁNEAS (FK)

-- FKs para MASCOTA
ALTER TABLE [dbo].[MASCOTA] WITH CHECK ADD FOREIGN KEY([cod_cliente])
REFERENCES [dbo].[CLIENTE] ([cod_cliente])
GO

ALTER TABLE [dbo].[MASCOTA] WITH CHECK ADD FOREIGN KEY([cod_tipo])
REFERENCES [dbo].[TIPO_MASCOTA] ([cod_tipo])
GO

-- FKs para ATENCION
ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_disponibilidad])
REFERENCES [dbo].[DISPONIBILIDAD] ([cod_disponibilidad])
GO

ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_mascota])
REFERENCES [dbo].[MASCOTA] ([cod_mascota])
GO

ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_tipoA])
REFERENCES [dbo].[TIPO_ATENCION] ([cod_tipoA])
GO

-- FKs para DETALLE_ATENCION
ALTER TABLE [dbo].[DETALLE_ATENCION] WITH CHECK ADD FOREIGN KEY([cod_atencion])
REFERENCES [dbo].[ATENCION] ([cod_atencion])
GO

ALTER TABLE [dbo].[DETALLE_ATENCION] WITH CHECK ADD FOREIGN KEY([cod_tipoA])
REFERENCES [dbo].[TIPO_ATENCION] ([cod_tipoA])
GO

USE dogtor;
GO

------------------------------------------------------------------
-- 1. INSERTS PARA TABLAS DE CATÁLOGO
------------------------------------------------------------------

-- TIPO_ATENCION (cod_tipoA)
INSERT INTO [dbo].[TIPO_ATENCION] ([descripcion]) VALUES
('Consulta General'),      -- 1
('Vacunación'),            -- 2
('Desparasitación'),       -- 3
('Cirugía Menor');         -- 4
GO

-- TIPO_MASCOTA (cod_tipo)
INSERT INTO [dbo].[TIPO_MASCOTA] ([nombre]) VALUES
('Perro'),                 -- 1
('Gato'),                  -- 2
('Roedor'),                -- 3
('Ave');                   -- 4
GO

-- DISPONIBILIDAD (cod_disponibilidad)
-- Slots de un día, 3 libres, 1 ocupado (para testear validación)
INSERT INTO [dbo].[DISPONIBILIDAD] ([fecha], [hora], [ocupada]) VALUES
('2025-11-10', '09:00:00', 0), -- 1: LIBRE
('2025-11-10', '10:00:00', 0), -- 2: LIBRE
('2025-11-10', '11:00:00', 1), -- 3: OCUPADA (TEST)
('2025-11-10', '14:00:00', 0); -- 4: LIBRE
GO

------------------------------------------------------------------
-- 2. INSERTS PARA CLIENTES
------------------------------------------------------------------

-- CLIENTE (cod_cliente)
-- NOTA: Los valores de 'password' son hashes SIMULADOS.
INSERT INTO [dbo].[CLIENTE] ([nombre], [apellido], [telefono], [dni], [password]) VALUES
('Ana', 'Gómez', '3511112233', 12345678, 'hash_ana_gomez'),        -- 1
('Carlos', 'López', '3514445566', 23456789, 'hash_carlos_lopez'),    -- 2
('Laura', 'Martínez', '3517778899', 34567890,'hash_laura_m');         -- 3
GO

------------------------------------------------------------------
-- 3. INSERTS PARA MASCOTAS (FKs a CLIENTE y TIPO_MASCOTA)
------------------------------------------------------------------

-- MASCOTA (cod_mascota)
INSERT INTO [dbo].[MASCOTA] ([nombre], [edad], [cod_cliente], [cod_tipo], [eliminado]) VALUES
('Fido', 5, 1, 1, 0), -- 1: Perro de Ana (Activo)
('Mishu', 2, 1, 2, 0), -- 2: Gato de Ana (Activo)
('Rex', 8, 2, 1, 0), -- 3: Perro de Carlos (Activo)
('Piolín', 1, 3, 4, 1); -- 4: Pájaro de Laura (Eliminado/Inactivo - Para testear lógica 'Activo')
GO

------------------------------------------------------------------
-- 4. INSERTS PARA ATENCION (Turnos existentes)
------------------------------------------------------------------

-- ATENCION (cod_atencion)
-- El slot 3 estaba en DISPONIBILIDAD con Ocupada=1, lo reservamos aquí.
INSERT INTO [dbo].[ATENCION] ([cod_disponibilidad], [cod_tipoA], [importe], [cod_mascota]) VALUES
(3, 1, 4500.00, 1); -- 1: Consulta General para Fido (slot 3)
GO

------------------------------------------------------------------
-- 5. INSERTS PARA DETALLE_ATENCION
------------------------------------------------------------------

-- DETALLE_ATENCION (Detalles del turno 1)
INSERT INTO [dbo].[DETALLE_ATENCION] ([cod_atencion], [cod_tipoA], [observaciones]) VALUES
(1, 1, 'Examen físico completo. Se recomienda desparasitación.'), -- 1
(1, 3, 'Se aplicó desparasitante interno.'); -- 2
GO

-- FIN DEL SCRIPT DE INSERCIÓN