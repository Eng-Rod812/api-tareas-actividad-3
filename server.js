const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// Ubicación de nuestro archivo JSON
const archivoTareas = path.join(__dirname, "tareas.json");
const archivoUsuarios = path.join(__dirname, "usuarios.json");

// Permite recibir información JSON
app.use(express.json());

// Middleware para verificar el token JWT
function autenticar(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Se requiere iniciar sesión"
    });
  }

  const token = autorizacion.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    req.usuario = datos;
    next();

  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
}

// Proteger todas las rutas de tareas
app.use("/tareas", autenticar);


// Ruta inicial
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de tareas funcionando correctamente"
  });
});

// Consultar todas las tareas
app.get("/tareas", async (req, res, next) => {
  try {
    const contenido = await fs.readFile(archivoTareas, "utf8");
    const tareas = JSON.parse(contenido);

    res.status(200).json(tareas);

  } catch (error) {
    next(error);
  }
});


// Crear una nueva tarea
app.post("/tareas", async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;

    // Validar los datos recibidos
    if (
      typeof titulo !== "string" ||
      typeof descripcion !== "string" ||
      !titulo.trim() ||
      !descripcion.trim()
    ) {
      return res.status(400).json({
        error: "El título y la descripción son obligatorios"
      });
    }

    // Leer las tareas existentes
    const contenido = await fs.readFile(archivoTareas, "utf8");
    const tareas = JSON.parse(contenido);

    // Crear una tarea con identificador único
    const nuevaTarea = {
      id: require("node:crypto").randomUUID(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim()
    };

    // Agregarla a la lista
    tareas.push(nuevaTarea);

    // Guardar el arreglo actualizado
    await fs.writeFile(
      archivoTareas,
      JSON.stringify(tareas, null, 2),
      "utf8"
    );

    // Confirmar que se creó
    res.status(201).json(nuevaTarea);

    } catch (error) {
    next(error);
  }
});


// Actualizar una tarea existente
app.put("/tareas/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    // Validar los datos recibidos
    if (
      typeof titulo !== "string" ||
      typeof descripcion !== "string" ||
      !titulo.trim() ||
      !descripcion.trim()
    ) {
      return res.status(400).json({
        error: "El título y la descripción son obligatorios"
      });
    }

    // Leer las tareas guardadas
    const contenido = await fs.readFile(archivoTareas, "utf8");
    const tareas = JSON.parse(contenido);

    // Buscar la tarea por su ID
    const tarea = tareas.find((t) => t.id === id);

    if (!tarea) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    // Actualizar los datos
    tarea.titulo = titulo.trim();
    tarea.descripcion = descripcion.trim();

    // Guardar los cambios
    await fs.writeFile(
      archivoTareas,
      JSON.stringify(tareas, null, 2),
      "utf8"
    );

    res.status(200).json(tarea);

  } catch (error) {
  next(error);
}
});

// Eliminar una tarea existente
app.delete("/tareas/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Leer las tareas guardadas
    const contenido = await fs.readFile(archivoTareas, "utf8");
    const tareas = JSON.parse(contenido);

    // Buscar si existe la tarea
    const indice = tareas.findIndex((tarea) => tarea.id === id);

    if (indice === -1) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    // Eliminar la tarea del arreglo
    tareas.splice(indice, 1);

    // Guardar el archivo actualizado
    await fs.writeFile(
      archivoTareas,
      JSON.stringify(tareas, null, 2),
      "utf8"
    );

    // Confirmar eliminación
    res.status(204).send();

      } catch (error) {
    next(error);
  }
});


// Registrar un nuevo usuario
app.post("/register", async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body ?? {};

    // Validar los datos recibidos
    if (
      typeof nombre !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !nombre.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8
    ) {
      return res.status(400).json({
        error: "Ingresa nombre, correo válido y contraseña de mínimo 8 caracteres"
      });
    }

    // Leer los usuarios registrados
    const contenido = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(contenido);

    const correo = email.trim().toLowerCase();

    // Evitar registrar dos veces el mismo correo
    const existe = usuarios.some((usuario) => usuario.email === correo);

    if (existe) {
      return res.status(409).json({
        error: "Este correo ya está registrado"
      });
    }

    // Proteger la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      id: require("node:crypto").randomUUID(),
      nombre: nombre.trim(),
      email: correo,
      passwordHash
    };

    usuarios.push(nuevoUsuario);

    // Guardar el usuario en el archivo JSON
    await fs.writeFile(
      archivoUsuarios,
      JSON.stringify(usuarios, null, 2),
      "utf8"
    );

    // Responder sin mostrar la contraseña ni su hash
    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });

    } catch (error) {
    next(error);
  }
});


// Iniciar sesión y generar un token JWT
app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Correo y contraseña obligatorios"
      });
    }

    const contenido = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(contenido);

    const usuario = usuarios.find(
      (u) => u.email === email.trim().toLowerCase()
    );

    // No revelamos si el correo existe o si falló la contraseña
    if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
      return res.status(401).json({
        error: "Credenciales incorrectas"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Falta configurar JWT_SECRET");
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      mensaje: "Inicio de sesión correcto",
      token
    });

    } catch (error) {
    next(error);
  }
});


// Manejar rutas que no existen
app.use((req, res, next) => {
  const error = new Error("La ruta solicitada no existe");
  error.status = 404;
  next(error);
});

// Middleware personalizado para manejar errores
app.use((err, req, res, next) => {
  console.error("Error detectado:", err.message);

  const estado = err.status || 500;

  res.status(estado).json({
    error: estado === 500
      ? "Error interno del servidor"
      : err.message
  });
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});