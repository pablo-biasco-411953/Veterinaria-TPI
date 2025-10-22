INSERT INTO Cliente (Nombre, Telefono, Dni) VALUES
('Juan',  '123456789', '12345678'),
('Ana',  '987654321', '87654321'),
('Luis',  '555123456', '45678912'),
('Maria',  '321654987', '78912345');

INSERT INTO Tipo_Mascota (Nombre) VALUES
('Perro'),
('Gato'),
('P�jaro'),
('Reptil'),
('Roedor');


INSERT INTO Mascota (Nombre, Edad, Cod_Cliente, Cod_Tipo, Eliminado) VALUES
('Fido', 3, 1, 1, 0),
('Miau', 2, 2, 2, 0),
('Rex', 5, 1, 1, 0),
('Luna', 1, 3, 2, 0),
('Nina', 4, 4, 1, 0);

INSERT INTO TIPO_ATENCION(Descripcion) VALUES
('Consulta general'),
('Vacunaci�n antirr�bica'),
('Castraci�n gato'),
('Castraci�n perro'),
('Desparacitaci�n');

INSERT INTO Disponibilidad (Fecha, Hora, Ocupada) VALUES
('2024-11-06', '09:00:00', 0),
('2024-11-06', '10:00:00', 0),
('2024-11-06', '11:00:00', 0),
('2024-11-06', '14:00:00', 0),
('2024-11-07', '09:00:00', 0),
('2024-11-07', '10:00:00', 0),
('2024-11-07', '11:00:00', 0),
('2024-11-07', '14:00:00', 0),
('2024-11-08', '09:00:00', 0),
('2024-11-08', '10:00:00', 0);

INSERT INTO Atencion (cod_disponibilidad,cod_tipoA,importe,cod_mascota ) VALUES
(1, 1, 10000,1),  -- Fido, consulta general
(2, 2, 20000 ,2),  -- Miau, vacunaci�n
(1, 3, 120000,3),  -- Rex, castraci�n gato
(2, 4, 250000,4),  -- Luna, castraci�n perro
(3, 5,10000,5);    -- Nina, desparacitaci�n
