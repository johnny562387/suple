const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const connection = require('./database/db'); // Asegúrate de tener configurada tu base de datos

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

// Rutas
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    const { nombre, usuario, contraseña } = req.body;
    let passwordHash = await bcryptjs.hash(contraseña, 8);
    connection.query('INSERT INTO usuario SET ?', { nombre, usuario, contraseña: passwordHash }, (error, results) => {
        if (error) {
            console.log(error);
            res.render('register.ejs', {
                alert: true,
                alertMessage: "Error al registrar. Inténtalo de nuevo.",
            });
        } else {
            // Redirige al usuario a la página de login después de registrarse
            res.redirect('/login');
        }
    });
});

app.post('/auth', async (req, res) => {
    const { usuario, contraseña } = req.body;
    if (usuario && contraseña) {
        connection.query('SELECT * FROM usuario WHERE usuario = ?', [usuario], async (error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(contraseña, results[0].contraseña))) {
                res.render('login.ejs', {
                    alert: true,
                    alertMessage: "Usuario y/o contraseña incorrectas",
                });
            } else {
                req.session.loggedin = true;
                req.session.nombre = results[0].nombre;
                res.redirect('/calcular');
            }
        });
    } else {
        res.render('login.ejs', {
            alert: true,
            alertMessage: "Por favor ingrese usuario y/o contraseña",
        });
    }
});

app.get('/calcular', (req, res) => {
    if (req.session.loggedin) {
        res.render('calcular.ejs', {
            nombre: req.session.nombre
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
