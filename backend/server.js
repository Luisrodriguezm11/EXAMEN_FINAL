const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Stripe = require('stripe'); // Importa Stripe

// Inicializa Stripe con tu clave secreta
const stripe = Stripe('sk_test_51Q9ZhsRqwuaDZ9m7vy3F248KJhgXeuuCir46dNZqhPRCWA2MDN6ELkm1GNH7ZzQ8MPACBxBPd3eD3c9I7dm4YOVC00uTSqSMGh');

const app = express();
const port = 3000;

// Configuración de conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'prueba_react',
    password: '1234',
    port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Clave secreta para JWT
const JWT_SECRET = 'mi_clave_secreta_super_segura';

// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token después de "Bearer"

    if (!token) return res.status(403).json({ message: 'Token requerido' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.userId = decoded.id;
        next();
    });
};

// Endpoint para crear un PaymentIntent de Stripe
app.post('/api/payment-intent', verifyToken, async (req, res) => {
    const { amount } = req.body; // Recibe el monto del costo del proyecto

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe trabaja en centavos
            currency: 'usd',
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el PaymentIntent');
    }
});

// Rutas CRUD para los items, ahora protegidas con verifyToken
app.get('/api/items', verifyToken, async (req, res) => {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
});

app.post('/api/items', verifyToken, async (req, res) => {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
});

app.put('/api/items/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query('UPDATE items SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
});

app.delete('/api/items/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.sendStatus(204);
});

// Rutas de autenticación y gestión de usuarios

// Registro de usuarios
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar el token JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Obtener todos los proyectos
app.get('/api/proyectos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proyectos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});

// Crear un nuevo proyecto
app.post('/api/proyectos', verifyToken, async (req, res) => {
    const {
        titulo,
        descripcion,
        completada,
        fecha_vencimiento,
        prioridad,
        asignado_a,
        categoria,
        costo_proyecto,
        pagado
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO proyectos (titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, pagado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [titulo, descripcion, completada || false, fecha_vencimiento, prioridad || 'media', asignado_a, categoria, costo_proyecto, pagado || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el proyecto' });
    }
});

// Actualizar un proyecto por ID
app.put('/api/proyectos/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        descripcion,
        completada,
        fecha_vencimiento,
        prioridad,
        asignado_a,
        categoria,
        costo_proyecto,
        pagado
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE proyectos SET titulo = $1, descripcion = $2, completada = $3, fecha_vencimiento = $4, prioridad = $5, asignado_a = $6, categoria = $7, costo_proyecto = $8, pagado = $9
            WHERE id = $10 RETURNING *`,
            [titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, pagado, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el proyecto' });
    }
});

// Eliminar un proyecto por ID
app.delete('/api/proyectos/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM proyectos WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (error) {
        res.status(400).json({ error: 'Error al eliminar el proyecto' });
    }
});

// Ruta protegida de ejemplo
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Acceso a ruta protegida' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
