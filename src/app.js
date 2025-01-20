require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();

// Configuração da sessão
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());

// Configuração do diretório público
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
console.log('Servindo arquivos estáticos de:', publicPath);

// Caminhos para os arquivos JSON
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'data', 'subscriptions.json');

// Funções auxiliares para usuários
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Funções auxiliares para inscrições
async function readSubscriptions() {
  try {
    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveSubscriptions(subscriptions) {
  await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// Rotas de autenticação
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await readUsers();

    // Verificar se o usuário já existe
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword
    };

    users.push(newUser);
    await saveUsers(users);
    
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    req.session.userId = user.id;
    res.json({ message: 'Login realizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rotas protegidas
app.post('/api/subscriptions', requireAuth, async (req, res) => {
  try {
    const { name, dueDate, amount, description } = req.body;
    const subscriptions = await readSubscriptions();
    
    subscriptions.push({
      id: Date.now().toString(),
      userId: req.session.userId,
      name,
      dueDate,
      amount,
      description,
      createdAt: new Date().toISOString()
    });

    await saveSubscriptions(subscriptions);
    res.status(201).json({ message: 'Inscrição adicionada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar inscrição' });
  }
});

app.get('/api/subscriptions', requireAuth, async (req, res) => {
  try {
    const subscriptions = await readSubscriptions();
    const userSubscriptions = subscriptions.filter(sub => sub.userId === req.session.userId);
    res.json(userSubscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
});

// Rota para deletar uma conta
app.delete('/api/subscriptions/:id', requireAuth, async (req, res) => {
  try {
    const subscriptions = await readSubscriptions();
    const subscription = subscriptions.find(sub => sub.id === req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    if (subscription.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== req.params.id);
    await saveSubscriptions(updatedSubscriptions);
    
    res.json({ message: 'Conta removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover conta' });
  }
});

// Rota para atualizar uma conta
app.put('/api/subscriptions/:id', requireAuth, async (req, res) => {
  try {
    const { name, dueDate, amount, description } = req.body;
    const subscriptions = await readSubscriptions();
    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === req.params.id);
    
    if (subscriptionIndex === -1) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    if (subscriptions[subscriptionIndex].userId !== req.session.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    subscriptions[subscriptionIndex] = {
      ...subscriptions[subscriptionIndex],
      name,
      dueDate,
      amount,
      description,
      updatedAt: new Date().toISOString()
    };
    
    await saveSubscriptions(subscriptions);
    res.json({ message: 'Conta atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// Configurar o transportador de email uma única vez
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Função para enviar notificações
async function sendNotifications() {
  try {
    const subscriptions = await readSubscriptions();
    const users = await readUsers();
    const today = new Date();
    
    for (const sub of subscriptions) {
      const user = users.find(u => u.id === sub.userId);
      if (!user) continue;

      const dueDate = new Date(sub.dueDate);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3 && diffDays >= 0) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Lembrete: ${sub.name} vence em ${diffDays} dias`,
            text: `
              Olá!
              
              Este é um lembrete para a conta: ${sub.name}
              Valor: € ${sub.amount}
              Vencimento: ${new Date(sub.dueDate).toLocaleDateString()}
              Descrição: ${sub.description}
              
              Não se esqueça de fazer o pagamento!
              
              Atenciosamente,
              Contas Lembrente
            `
          });
        } catch (error) {
          console.error(`Erro ao enviar email para ${user.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
  }
}

// Agendar verificação diária às 9h
cron.schedule('0 9 * * *', sendNotifications);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});