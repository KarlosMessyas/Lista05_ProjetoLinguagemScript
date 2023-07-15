const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { log } = require('console');

const app = express();

// Configs
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/partida/:id', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, 'public/partida.html'));
})

app.post('/partida', (req, res) => {
    const { titulo, local, dataEvento, horario } = req.body;

    const partida = {
        titulo,
        local,
        dataEvento,
        horario,
        jogadores: [],
        id: uuidv4(),
        createdAt: Date()
    }

    const data = fs.readFileSync('./database/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.log("Ocorreu um erro: " + err);
        }
        return JSON.parse(data);
    })

    const db = JSON.parse(data);

    db.push(partida);

    const partidaCriada = fs.writeFileSync('./database/db.json', JSON.stringify(db), err => {
        if (err) {
            console.log(`Ocorreu um erro: ${err}`);
        }
    });

    res.status(201).redirect('/');

});

app.get('/partidas', (req, res) => {

    const data = fs.readFileSync('./database/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.log("Ocorreu um erro: " + err);
        }
        return JSON.parse(data);
    })

    res.status(200).send(data);

})

app.get('/dados/partida/:id', (req, res) => {
    const { id } = req.params;
    const data = fs.readFileSync('./database/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.log("Ocorreu um erro: " + err);
        }
        return JSON.parse(data).filter(partida => partida.id === id);
    })

    res.status(200).send(data);

})

app.post('/excluir/:id', (req, res) => {

    const { id } = req.params;
    try {
        const data = fs.readFileSync('./database/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.log("Ocorreu um erro: " + err);
            }
            return JSON.parse(data);
        })

        const objetoPartidas = JSON.parse(data);
        const partidaExcluida = objetoPartidas.filter(partida => partida.id !== id);

        const novoArrayPartidas = fs.writeFileSync('./database/db.json', JSON.stringify(partidaExcluida), err => {
            if (err) {
                console.log(err.message);
            }
        });

        res.status(200).send(novoArrayPartidas);

    } catch (e) {
        console.log(`Ocorreu um erro: ${e.message}`);
    }

})


app.post('/partida/:id/adicionarJogador', (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;
    console.log(req.body);
    const jogador = {
        nome,
        telefone,
        id: uuidv4(),
        presencaConfirmada: false,
        createdAt: new Date()
    }

    try {
        const data = fs.readFileSync('./database/db.json', 'utf-8');
        let partidas = JSON.parse(data);

        let partida = partidas.find(partida => partida.id === id);
        if (!partida) {
            return res.status(404).send('Partida não encontrada');
        }

        partidas = partidas.filter(partida => partida.id !== id);

        partida.jogadores.push(jogador);
        partidas.push(partida);

        console.log(partidas)

        fs.writeFileSync('./database/db.json', JSON.stringify(partidas));

        return res.status(201).send(jogador);

    } catch (err) {
        console.log(`Ocorreu um erro: ${err.message}`);
        return res.status(500).send('Ocorreu um erro ao adicionar o jogador à partida');
    }
});

app.put('/partida/:idPartida/jogador/:idJogador/confirmarPresenca', (req, res) => {
    const { idPartida, idJogador } = req.params;

    try {
        const data = fs.readFileSync('./database/db.json', 'utf-8');
        let partidas = JSON.parse(data);

        let partida = partidas.find(partida => partida.id === idPartida);
        if (!partida) {
            return res.status(404).send('Partida não encontrada');
        }

        let jogadores = partida.jogadores;
        let jogador = jogadores.find(jogador => jogador.id === idJogador);
        if (!jogador) {
            return res.status(404).send('Jogador não encontrado');
        }

        jogador.presencaConfirmada = true;

        fs.writeFileSync('./database/db.json', JSON.stringify(partidas));

        return res.status(200).send(jogador);

    } catch (err) {
        console.log(`Ocorreu um erro: ${err.message}`);
        return res.status(500).send('Ocorreu um erro ao atualizar a presença do jogador');
    }
});

app.listen(3000, () => console.log(`O servidor está rodando em http://localhost:3000`));