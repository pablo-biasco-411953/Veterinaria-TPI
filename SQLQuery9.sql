-- 1. CREACIÓN DE LA BASE DE DATOS (si no existe)
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'dogtor2')
BEGIN
    CREATE DATABASE dogtor2;
END
GO

USE dogtor2;
GO

------------------------------------------------------------------
-- 2. ELIMINACIÓN DE CLAVES FORÁNEAS Y TABLAS (Para permitir la recreación limpia)
------------------------------------------------------------------

-- Eliminar FKs para ATENCION (Necesario antes de eliminar DISPONIBILIDAD)
IF OBJECT_ID('FK_ATENCION_DISPONIBILIDAD', 'F') IS NOT NULL
BEGIN
    ALTER TABLE [dbo].[ATENCION] DROP CONSTRAINT FK_ATENCION_DISPONIBILIDAD;
END
GO

-- Eliminar tablas existentes
IF OBJECT_ID('dbo.DETALLE_ATENCION', 'U') IS NOT NULL DROP TABLE dbo.DETALLE_ATENCION;
IF OBJECT_ID('dbo.ATENCION', 'U') IS NOT NULL DROP TABLE dbo.ATENCION;
IF OBJECT_ID('dbo.MASCOTA', 'U') IS NOT NULL DROP TABLE dbo.MASCOTA;
IF OBJECT_ID('dbo.CLIENTE', 'U') IS NOT NULL DROP TABLE dbo.CLIENTE;
IF OBJECT_ID('dbo.VETERINARIO', 'U') IS NOT NULL DROP TABLE dbo.VETERINARIO; -- NUEVA TABLA
IF OBJECT_ID('dbo.DISPONIBILIDAD', 'U') IS NOT NULL DROP TABLE dbo.DISPONIBILIDAD;
IF OBJECT_ID('dbo.ESTADO_ATENCION', 'U') IS NOT NULL DROP TABLE dbo.ESTADO_ATENCION;
IF OBJECT_ID('dbo.TIPO_MASCOTA', 'U') IS NOT NULL DROP TABLE dbo.TIPO_MASCOTA;
IF OBJECT_ID('dbo.TIPO_ATENCION', 'U') IS NOT NULL DROP TABLE dbo.TIPO_ATENCION;
GO

------------------------------------------------------------------
-- 3. CREACIÓN DE TABLAS DE CATÁLOGO Y ESTADO
------------------------------------------------------------------

-- TIPO_ATENCION
CREATE TABLE [dbo].[TIPO_ATENCION](
	[cod_tipoA] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED ([cod_tipoA] ASC)
) ON [PRIMARY]
GO

-- TIPO_MASCOTA
CREATE TABLE [dbo].[TIPO_MASCOTA](
	[cod_tipo] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED ([cod_tipo] ASC)
) ON [PRIMARY]
GO

-- ESTADO_ATENCION
CREATE TABLE [dbo].[ESTADO_ATENCION](
	[cod_estado] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED ([cod_estado] ASC)
) ON [PRIMARY]
GO

-- DISPONIBILIDAD
CREATE TABLE [dbo].[DISPONIBILIDAD](
	[cod_disponibilidad] [int] IDENTITY(1,1) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[hora] [time](7) NOT NULL,
    [cod_estado] [int] NOT NULL, 
PRIMARY KEY CLUSTERED ([cod_disponibilidad] ASC)
) ON [PRIMARY]
GO

------------------------------------------------------------------
-- 4. CREACIÓN DE TABLAS TRANSACCIONALES
------------------------------------------------------------------

-- CLIENTE (Datos de la persona, NO se usa para autenticación ahora)
CREATE TABLE [dbo].[CLIENTE](
	[cod_cliente] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](100) NOT NULL,
	[apellido] [varchar](100) NOT NULL,
	[telefono] [varchar](10) NOT NULL,
	[dni] [int] NOT NULL,
PRIMARY KEY CLUSTERED ([cod_cliente] ASC),
UNIQUE NONCLUSTERED ([dni] ASC)
) ON [PRIMARY]
GO

-- 💥 NUEVA TABLA: VETERINARIO (Con autenticación)
CREATE TABLE [dbo].[VETERINARIO](
	[cod_veterinario] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](100) NOT NULL,
	[apellido] [varchar](100) NOT NULL,
	[matricula] [varchar](50) NOT NULL,
    [email] [varchar](100) NOT NULL, -- Campo para login
    [password] [varchar](150) NOT NULL, -- Hash de Password para login
PRIMARY KEY CLUSTERED ([cod_veterinario] ASC),
UNIQUE NONCLUSTERED ([email] ASC) -- El email debe ser único para el login
) ON [PRIMARY]
GO

-- MASCOTA
CREATE TABLE [dbo].[MASCOTA](
	[cod_mascota] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [varchar](50) NOT NULL,
	[edad] [int] NOT NULL,
	[cod_cliente] [int] NOT NULL,
	[cod_tipo] [int] NOT NULL,
	[eliminado] [bit] NOT NULL DEFAULT 1,
PRIMARY KEY CLUSTERED ([cod_mascota] ASC)
) ON [PRIMARY]
GO

-- ATENCION (Turnos)
CREATE TABLE [dbo].[ATENCION](
	[cod_atencion] [int] IDENTITY(1,1) NOT NULL,
	[cod_disponibilidad] [int] NOT NULL,
	[cod_tipoA] [int] NOT NULL,
	[importe] [decimal](10, 2) NULL,
	[cod_mascota] [int] NOT NULL,
    [cod_veterinario] [int] NULL, -- 💡 FK al veterinario que realizó la atención
PRIMARY KEY CLUSTERED ([cod_atencion] ASC)
) ON [PRIMARY]
GO

-- DETALLE_ATENCION
CREATE TABLE [dbo].[DETALLE_ATENCION](
	[cod_detalle] [int] IDENTITY(1,1) NOT NULL,
	[cod_atencion] [int] NOT NULL,
	[cod_tipoA] [int] NOT NULL,
    [observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED ([cod_detalle] ASC)
) ON [PRIMARY]
GO


------------------------------------------------------------------
-- 5. DEFINICIÓN DE CLAVES FORÁNEAS (FK) ACTUALIZADAS
------------------------------------------------------------------

-- FK para DISPONIBILIDAD
ALTER TABLE [dbo].[DISPONIBILIDAD] WITH CHECK ADD FOREIGN KEY([cod_estado])
REFERENCES [dbo].[ESTADO_ATENCION] ([cod_estado])
GO

-- FKs para MASCOTA
ALTER TABLE [dbo].[MASCOTA] WITH CHECK ADD FOREIGN KEY([cod_cliente])
REFERENCES [dbo].[CLIENTE] ([cod_cliente])
GO

ALTER TABLE [dbo].[MASCOTA] WITH CHECK ADD FOREIGN KEY([cod_tipo])
REFERENCES [dbo].[TIPO_MASCOTA] ([cod_tipo])
GO

-- FKs para ATENCION
ALTER TABLE [dbo].[ATENCION] ADD CONSTRAINT FK_ATENCION_DISPONIBILIDAD FOREIGN KEY([cod_disponibilidad])
REFERENCES [dbo].[DISPONIBILIDAD] ([cod_disponibilidad])
GO

ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_mascota])
REFERENCES [dbo].[MASCOTA] ([cod_mascota])
GO

ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_tipoA])
REFERENCES [dbo].[TIPO_ATENCION] ([cod_tipoA])
GO

-- 💡 NUEVA FK para VETERINARIO en ATENCION
ALTER TABLE [dbo].[ATENCION] WITH CHECK ADD FOREIGN KEY([cod_veterinario])
REFERENCES [dbo].[VETERINARIO] ([cod_veterinario])
GO

-- FKs para DETALLE_ATENCION
ALTER TABLE [dbo].[DETALLE_ATENCION] WITH CHECK ADD FOREIGN KEY([cod_atencion])
REFERENCES [dbo].[ATENCION] ([cod_atencion])
GO

ALTER TABLE [dbo].[DETALLE_ATENCION] WITH CHECK ADD FOREIGN KEY([cod_tipoA])
REFERENCES [dbo].[TIPO_ATENCION] ([cod_tipoA])
GO

USE dogtor2;
GO

------------------------------------------------------------------
-- 6. INSERTS DE CATÁLOGO Y ESTADOS
------------------------------------------------------------------

-- TIPO_ATENCION
INSERT INTO [dbo].[TIPO_ATENCION] ([descripcion]) VALUES
('Consulta General'), ('Vacunación'), ('Desparasitación'), ('Cirugía Menor');
GO

-- TIPO_MASCOTA
INSERT INTO [dbo].[TIPO_MASCOTA] ([nombre]) VALUES
('Perro'), ('Gato'), ('Roedor'), ('Ave');
GO

-- ESTADO_ATENCION
INSERT INTO [dbo].[ESTADO_ATENCION] ([nombre]) VALUES
('Libre'), ('Reservado'), ('Finalizado'), ('Cancelado');
GO

-- DISPONIBILIDAD (usando cod_estado)
INSERT INTO [dbo].[DISPONIBILIDAD] ([fecha], [hora], [cod_estado]) VALUES
('2025-11-10', '09:00:00', 1), -- 1: Libre
('2025-11-10', '11:00:00', 2); -- 2: Reservado
GO

------------------------------------------------------------------
-- 7. INSERTS DE USUARIOS Y MASCOTAS
------------------------------------------------------------------

-- CLIENTE (Ya no tiene password)
INSERT INTO [dbo].[CLIENTE] ([nombre], [apellido], [telefono], [dni]) VALUES
('Ana', 'Gómez', '3511112233', 12345678), -- 1
('Carlos', 'López', '3514445566', 23456789); -- 2
GO

-- 💥 INSERTS para VETERINARIO (La autenticación se basa en estos datos)
INSERT INTO [dbo].[VETERINARIO] ([nombre], [apellido], [matricula], [email], [password]) VALUES
('Dr. Juan', 'Pérez', 'MP-1234', 'juan.perez@dogtor.com', 'hash_veterinario_1'), -- 1
('Dra. Laura', 'Díaz', 'MP-5678', 'laura.diaz@dogtor.com', 'hash_veterinario_2'); -- 2
GO

-- MASCOTA
INSERT INTO [dbo].[MASCOTA] ([nombre], [edad], [cod_cliente], [cod_tipo], [eliminado]) VALUES
('Fido', 5, 1, 1, 1), -- 1: Perro de Ana
('Rex', 8, 2, 1, 1); -- 2: Perro de Carlos
GO

------------------------------------------------------------------
-- 8. INSERTS PARA ATENCION Y DETALLE_ATENCION
------------------------------------------------------------------

-- ATENCION
INSERT INTO [dbo].[ATENCION] ([cod_disponibilidad], [cod_tipoA], [importe], [cod_mascota], [cod_veterinario]) VALUES
(2, 1, 4500.00, 1, 1); -- 1: Consulta General para Fido (Reservado), por el Dr. Juan Pérez
GO

-- DETALLE_ATENCION
INSERT INTO [dbo].[DETALLE_ATENCION] ([cod_atencion], [cod_tipoA], [observaciones]) VALUES
(1, 1, 'Examen físico completo.'),
(1, 3, 'Se aplicó desparasitante interno.');
GO