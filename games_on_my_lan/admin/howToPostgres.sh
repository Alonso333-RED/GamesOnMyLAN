#!/bin/bash

echo "
============================================================
PostgreSQL - Tutorial básico de acceso y usuarios
Solo muestra información. NO ejecuta comandos.
============================================================


------------------------------------------------------------
1) Entrar a PostgreSQL como usuario administrador postgres
------------------------------------------------------------

En Linux normalmente se usa:

sudo -u postgres psql


Resultado esperado:

postgres=#



------------------------------------------------------------
2) Entrar a PostgreSQL usando un usuario específico
------------------------------------------------------------

Sintaxis:

psql -U NOMBRE_USUARIO


Ejemplo:

psql -U USUARIO


Con contraseña:

psql -U USUARIO -W



------------------------------------------------------------
3) Entrar a una base de datos específica
------------------------------------------------------------

Sintaxis:

psql -U USUARIO -d BASE_DE_DATOS


Ejemplo:

psql -U USUARIO -d BASE_DE_DATOS


Con contraseña:

psql -U USUARIO -d BASE_DE_DATOS -W

------------------------------------------------------------
IMPORTANTE (Linux)
------------------------------------------------------------

Si al ejecutar:

psql -U nombre_usuario -d nombre_database -W

aparece el error:

FATAL: Peer authentication failed for user "nombre_usuario"

significa que PostgreSQL está usando autenticación "peer",
por lo que NO utilizará la contraseña aunque se especifique -W.

Para permitir el acceso mediante contraseña:

1) Editar el archivo pg_hba.conf

   sudo nano /etc/postgresql/*/main/pg_hba.conf

2) Buscar una línea similar a:

   local   all   all   peer

3) Cambiar "peer" por:

   scram-sha-256

   (o "md5" en instalaciones antiguas).

   Quedando por ejemplo:

   local   all   all   scram-sha-256

4) Reiniciar PostgreSQL:

   sudo systemctl restart postgresql

Después de eso, el siguiente comando utilizará la contraseña:

psql -U nombre_usuario -d nombre_database -W

------------------------------------------------------------
4) Entrar como postgres a una base específica
------------------------------------------------------------

sudo -u postgres psql -d NOMBRE_DATABASE


Ejemplo:

sudo -u postgres psql -d postgres



============================================================
Creación y configuración de usuarios
============================================================


------------------------------------------------------------
5) Ver usuarios existentes
------------------------------------------------------------

Dentro de PostgreSQL:

\\du



------------------------------------------------------------
6) Crear un usuario
------------------------------------------------------------

CREATE USER nombre_usuario;


Ejemplo:

CREATE USER USUARIO;



------------------------------------------------------------
7) Crear usuario con contraseña
------------------------------------------------------------

CREATE USER nombre_usuario
WITH PASSWORD 'contraseña';


Ejemplo:

CREATE USER USUARIO
WITH PASSWORD '123456';



------------------------------------------------------------
8) Crear usuario administrador
------------------------------------------------------------

CREATE USER nombre_usuario
WITH SUPERUSER PASSWORD 'contraseña';


Ejemplo:

CREATE USER admin
WITH SUPERUSER PASSWORD 'clave_segura';



------------------------------------------------------------
9) Cambiar contraseña
------------------------------------------------------------

ALTER USER nombre_usuario
WITH PASSWORD 'nueva_contraseña';



------------------------------------------------------------
10) Dar permisos a una base de datos
------------------------------------------------------------

GRANT ALL PRIVILEGES
ON DATABASE nombre_database
TO nombre_usuario;



------------------------------------------------------------
11) Crear una base de datos con dueño
------------------------------------------------------------

CREATE DATABASE nombre_database
OWNER nombre_usuario;



------------------------------------------------------------
12) Cambiar dueño de una base existente
------------------------------------------------------------

ALTER DATABASE nombre_database
OWNER TO nombre_usuario;



------------------------------------------------------------
13) Eliminar usuario
------------------------------------------------------------

DROP USER nombre_usuario;



============================================================
Comandos útiles dentro de psql
============================================================


Listar bases de datos:

\\l


Cambiar de base:

\\c nombre_database


Mostrar tablas:

\\dt


Ver estructura de tabla:

\\d nombre_tabla


Salir:

\\q



============================================================
Ejemplo para una aplicación Node.js
============================================================


1) Entrar como administrador:

sudo -u postgres psql


2) Crear usuario:

CREATE USER app_user
WITH PASSWORD 'password_seguro';


3) Crear base:

CREATE DATABASE app_database
OWNER app_user;


4) Dar permisos:

GRANT ALL PRIVILEGES
ON DATABASE app_database
TO app_user;


5) Conexión desde terminal:

psql -U app_user -d app_database -W

------------------------------------------------------------
14) Eliminar un usuario
------------------------------------------------------------

Forma básica:

DROP USER nombre_usuario;


Ejemplo:

DROP USER USUARIO;



------------------------------------------------------------
15) Eliminar usuario que tiene objetos creados
------------------------------------------------------------

Si PostgreSQL no permite eliminarlo porque tiene
tablas, permisos u objetos asociados:


Primero reasignar sus objetos:

REASSIGN OWNED BY nombre_usuario TO postgres;


Después eliminar sus permisos:

DROP OWNED BY nombre_usuario;


Finalmente eliminar el usuario:

DROP USER nombre_usuario;



Ejemplo completo:

REASSIGN OWNED BY USUARIO TO postgres;

DROP OWNED BY USUARIO;

DROP USER USUARIO;



------------------------------------------------------------
16) Eliminar usuario que es dueño de una base de datos
------------------------------------------------------------

Primero cambiar el propietario de la base:


ALTER DATABASE nombre_database
OWNER TO postgres;


Ejemplo:

ALTER DATABASE BASE_DE_DATOS
OWNER TO postgres;


Después eliminar el usuario:

DROP USER USUARIO;



------------------------------------------------------------
17) Ver usuarios antes de eliminar
------------------------------------------------------------

Dentro de PostgreSQL:

\\du



------------------------------------------------------------
FIN DE TUTORIAL
------------------------------------------------------------
"