// Importação de módulos
import 'dotenv/config';  
import express from 'express';  
import cors from 'cors';  
import http from 'http';  
import { Server } from 'socket.io';  
 
// Importação de rotas
import { createNewSession, getUserSessions, getQrCode } from './src/routes/sessionsRoutes.mjs'; 

import { checkAuth, registerUser, loginUser } from './src/routes/authRoutes.mjs'; 
import sellerRoutes from './src/routes/sellers.mjs';



// Importação de utilitários
import initSessions from './src/utils/initSession.mjs'; // Função de inicialização de sessões

// Configurações iniciais
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
  },
});
const PORT = process.env.PORT || 3000;
const sessions = {};

// Configuração de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Middleware para parsing de JSON
app.use(express.json());

// Registrar rotas
app.use('/api/auth', checkAuth);
app.use('/api/auth', registerUser);
app.use('/api/auth', loginUser);
app.use('/api/sellers', sellerRoutes); 
app.use('/api/sessions', createNewSession(this.server, sessions));  
app.use('/api/sessions', getQrCode(sessions));
app.use('/api/sessions', getUserSessions);

// Middleware global para tratamento de erros
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.', details: err.message });
});

// Iniciar servidor HTTP e WebSocket
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Configuração de WebSocket
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Inicializar sessões
initSessions(sessions, io);
