const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const cors = require('cors');  // Importar o CORS
const bcrypt = require('bcrypt'); // Importar bcrypt
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();



console.log(process.env.JWT_SECRET);

// Iniciar a aplicação Express
const app = express();

// Configurar o CORS para permitir todas as origens (ajuste conforme necessário)
app.use(cors());  // Aplicar o middleware CORS

// Middleware para aceitar JSON no corpo das requisições
app.use(express.json());
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now()+"-"+Math.round(Math.random()*1E9)+".png"
        cb(null,file.fieldname+"-"+uniqueSuffix)
        // cb(null, Date.now() + path.extname(file.originalname)); // Adiciona um timestamp ao nome do arquivo
    }
});

const upload = multer({ storage: storage });


// Conectar ao MongoDB
mongoose.connect('mongodb+srv://Adm:tudoemsp0110@tudoemsp.hnp8u.mongodb.net/tudoemsp', {})
    .then(() => {
        console.log('Conectado ao MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao MongoDB Atlas:', error);
    });

// Criar o esquema (schema) e o modelo (model) para Usuário
// Criar o esquema (schema) e o modelo (model) para Usuário
// Criar o esquema (schema) e o modelo (model) para Usuário
const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    criadoEm: { type: Date },
    fotoPerfil: { type: String }  // Adicionar o campo para a URL da foto de perfil
});

const User = mongoose.model('User', UserSchema);

// Rota para registrar um novo usuário com foto de perfil
app.post('/usuarios', upload.single('fotoPerfil'), async (req, res) => {
    const { nome, email, senha, } = req.body;
    const fotoPerfil = req.file ? req.file.path : ''; // Caminho do arquivo

    try {
        const criadoEm = moment().tz('America/Sao_Paulo').toDate();
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = new User({ nome, email, senha: senhaCriptografada, criadoEm, fotoPerfil });
        await novoUsuario.save();

        const criadoEmFormatado = moment(novoUsuario.criadoEm).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

        res.status(201).send({
            ...novoUsuario.toObject(),
            criadoEm: criadoEmFormatado
        });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(400).send({ erro: 'Erro ao cadastrar usuário' });
    }
});


// Rota para atualizar um usuário
app.put('/usuarios/:id', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const usuarioExistente = await User.findById(req.params.id);

        if (!usuarioExistente) {
            return res.status(404).send({ erro: 'Usuário não encontrado' });
        }

        if (email && email !== usuarioExistente.email) {
            const emailExistente = await User.findOne({ email });
            if (emailExistente) {
                return res.status(400).send({ erro: 'O email já está em uso por outro usuário' });
            }
        }

        const atualizadoEm = moment().tz('America/Sao_Paulo').toDate();
        const usuarioAtualizado = await User.findByIdAndUpdate(
            req.params.id,
            { nome, email, senha, atualizadoEm },
            { new: true }
        );

        const atualizadoEmFormatado = moment(usuarioAtualizado.atualizadoEm).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

        res.status(200).send({
            ...usuarioAtualizado.toObject(),
            atualizadoEm: atualizadoEmFormatado
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(400).send({ erro: 'Erro ao atualizar usuário' });
    }
});

// Criar o esquema (schema) e o modelo (model) para Evento
const EventoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    dataInicio: { type: String, required: true },
    dataFim: { type: String, required: true },
    local: { type: String, required: true },
    tipo: { type: String, required: true },
    link: { type: String, required: true },
    fotos: { type: [String] },
    criadoEm: { type: Date },
    atualizadoEm: { type: Date }
});

const Evento = mongoose.model('Evento', EventoSchema);

app.get('/eventos', async (req, res) => {
    try {
        const eventos = await Evento.find().populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.get('/parque', async (req, res) => {
    try {
        const eventos = await Evento.find({ tipo: "Parque" }).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));
        console.log(JSON.stringify(eventosFormatados))
        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.get('/pracas', async (req, res) => {
    try {
        const eventos = await Evento.find({ tipo: "Praças" }).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.get('/evento', async (req, res) => {
    try {
        const eventos = await Evento.find({ tipo: "Eventos" }).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.get('/shopping', async (req, res) => {
    try {
        const eventos = await Evento.find({tipo:"Shopping"}).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.get('/zoologico', async (req, res) => {
    try {
        const eventos = await Evento.find({tipo:"Zoologico"}).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});
app.get('/sesc', async (req, res) => {
    try {
        const eventos = await Evento.find({tipo:"Sesc"}).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
}); 
app.get('/aquario', async (req, res) => {
    try {
        const eventos = await Evento.find({tipo:"Aquario"}).populate('local');
        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

// Rota para cadastrar um novo evento com as fotos fornecidas manualmente
app.post('/eventos', async (req, res) => {
    const { nome, descricao, dataInicio, dataFim, local, tipo, link, fotos } = req.body;

    // Verificar se o array de fotos contém no máximo 5 URLs
    if (fotos && fotos.length > 5) {
        return res.status(400).send({ erro: 'Você pode fornecer no máximo 5 fotos' });
    }

    try {
        const criadoEm = moment().tz('America/Sao_Paulo').toDate();
        const novoEvento = new Evento({ nome, descricao, dataInicio, dataFim, local, tipo, link, fotos, criadoEm });
        await novoEvento.save();

        const criadoEmFormatado = moment(novoEvento.criadoEm).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

        res.status(201).send({
            ...novoEvento.toObject(),
            criadoEm: criadoEmFormatado
        });
    } catch (error) {
        console.error('Erro ao cadastrar evento:', error);
        res.status(400).send({ erro: 'Erro ao cadastrar evento' });
    }

});


// Rota para atualizar um evento com as fotos fornecidas manualmente
app.put('/eventos/:id', async (req, res) => {
    const { nome, descricao, dataInicio, dataFim, local, tipo, link, fotos } = req.body;

    // Verificar se o array de fotos contém no máximo 5 URLs
    if (fotos && fotos.length > 5) {
        return res.status(400).send({ erro: 'Você pode fornecer no máximo 5 fotos' });
    }

    try {
        const atualizadoEm = moment().tz('America/Sao_Paulo').toDate();
        const eventoAtualizado = await Evento.findByIdAndUpdate(
            req.params.id,
            { nome, descricao, dataInicio, dataFim, local, tipo, link, fotos, atualizadoEm },
            { new: true }
        );

        if (!eventoAtualizado) {
            return res.status(404).send({ erro: 'Evento não encontrado' });
        }

        const atualizadoEmFormatado = moment(eventoAtualizado.atualizadoEm).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

        res.status(200).send({
            ...eventoAtualizado.toObject(),
            atualizadoEm: atualizadoEmFormatado
        });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(400).send({ erro: 'Erro ao atualizar evento' });
    }
});

// Rota para deletar um evento
app.delete('/eventos/:id', async (req, res) => {
    try {
        const eventoDeletado = await Evento.findByIdAndDelete(req.params.id);

        if (!eventoDeletado) {
            return res.status(404).send({ erro: 'Evento não encontrado ou informação fornecida incorreta' });
        }

        res.status(200).send({ mensagem: 'Evento deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(400).send({ erro: 'Erro ao deletar evento' });
    }
});
app.get('/eventos/:nome', async (req, res) => {
    try {
        // Criar uma expressão regular para buscar o nome ignorando maiúsculas/minúsculas e permitindo correspondência parcial
        const regex = new RegExp(req.params.nome, 'i'); // 'i' para ignorar case sensitivity

        // Buscar eventos pelo nome usando regex
        const eventos = await Evento.find({ nome: { $regex: regex } }).populate('local');

        if (eventos.length === 0) {
            return res.status(404).send({ erro: 'Nenhum evento encontrado com esse nome' });
        }

        const eventosFormatados = eventos.map(evento => ({
            ...evento.toObject(),
        }));

        res.status(200).send(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).send({ erro: 'Erro ao buscar eventos' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send({ erro: 'Usuário não encontrado' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).send({ erro: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { id: usuario._id, nome: usuario.nome, email: usuario.email, fotoPerfil: usuario.fotoPerfil },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).send({
            mensagem: 'Login bem-sucedido',
            token,
            fotoPerfil: usuario.fotoPerfil
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send({ erro: 'Erro no login' });
    }
});


// Middleware de autenticação de token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Rota para obter perfil do usuário autenticado
app.get('/perfil', authenticateToken, (req, res) => {
    res.status(200).send({ mensagem: `Bem-vindo ao seu perfil, ${req.user.nome}` });
});


// Iniciar o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
