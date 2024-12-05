const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Registro
app.post('/register', (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).send('As senhas não coincidem.');
  }

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, hash],
    (err) => {
      if (err) {
        return res.status(400).send('Erro ao registrar: ' + err.message);
      }
      res.send('Usuário registrado com sucesso!');
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) {
      return res.status(400).send('Usuário não encontrado.');
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Senha inválida.');
    }
    res.send({ message: 'Login bem-sucedido!', userId: user.id });
  });
});

// Adicionar caixa
app.post('/add-box', (req, res) => {
  const { title, description, language, code, userId } = req.body;
  db.run(
    `INSERT INTO boxes (title, description, language, code, user_id) VALUES (?, ?, ?, ?, ?)`,
    [title, description, language, code, userId],
    (err) => {
      if (err) {
        return res.status(400).send('Erro ao adicionar caixa: ' + err.message);
      }
      res.send('Caixa adicionada com sucesso!');
    }
  );
});

// Pesquisar caixas
app.get('/search', (req, res) => {
  const { query, userId } = req.query;
  db.all(
    `SELECT * FROM boxes WHERE (title LIKE ? OR description LIKE ? OR language LIKE ?) AND user_id = ?`,
    [`%${query}%`, `%${query}%`, `%${query}%`, userId],
    (err, rows) => {
      if (err) {
        return res.status(400).send('Erro ao buscar caixas: ' + err.message);
      }
      res.send(rows);
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
