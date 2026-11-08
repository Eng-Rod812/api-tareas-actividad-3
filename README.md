
# API RESTful de Gestión de Tareas

Proyecto desarrollado con Node.js y Express para la Actividad 3 de Desarrollo Full Stack.

## Funcionalidades

- Operaciones CRUD para gestionar tareas.
- Almacenamiento asíncrono mediante `fs/promises` y archivos JSON.
- Registro de usuarios con contraseñas protegidas mediante bcrypt.
- Autenticación con JSON Web Tokens (JWT).
- Protección de las rutas de tareas.
- Manejo centralizado de errores.
- Depuración mediante herramientas de Node.js y VS Code.

## Requisitos

- Node.js y npm instalados.
- Postman para probar los endpoints.

## Instalación

1. Abrir una terminal dentro del proyecto.
2. Instalar las dependencias:

```bash
npm install
```

3. Crear el archivo `usuarios.json` a partir de `usuarios.ejemplo.json`. Debe comenzar con:

```json
[]
```

4. Configurar una clave JWT en PowerShell:

```powershell
$env:JWT_SECRET = [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
```

5. Iniciar el servidor desde esa misma terminal:

```bash
node server.js
```

El servidor estará disponible en:

http://localhost:3000

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | / | Verificar funcionamiento |
| POST | /register | Registrar usuario |
| POST | /login | Iniciar sesión y obtener JWT |
| GET | /tareas | Consultar tareas |
| POST | /tareas | Crear tarea |
| PUT | /tareas/:id | Actualizar tarea |
| DELETE | /tareas/:id | Eliminar tarea |

## Autenticación

Las rutas `/tareas` requieren un token JWT válido.

Primero se registra un usuario mediante `/register` y después se inicia sesión mediante `/login`.

En Postman, el token se introduce en:

Authorization → Bearer Token

## Almacenamiento

- `tareas.json`: almacena las tareas.
- `usuarios.json`: almacena los uauarios registrados y sus hashes de contraseña.
- `usuarios.ejemplo.json`: archivo vacío de referencia para inicializar los usuarios.

El archivo `usuarios.json` y las claves privadas no deben publicarse en GitHub.
