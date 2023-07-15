const formEnviarPartida = document.querySelector("#formEnviarPartida");

formEnviarPartida.addEventListener("submit", (e) => {
    exibirListaDePartidas();
})

async function exibirListaDePartidas() {
    const listaDePartidas = document.querySelector("#listaDePartidas");
    const data = await carregarDadosDaAPI();
    data.map((dado) => {
        const li = document.createElement("li");
        const verDetalhes = document.createElement("button");
        verDetalhes.innerText = "Detalhes";
        verDetalhes.addEventListener('click', () => {
            window.location.href = `/partida/${dado.id}`;
        });
        const excluirPartidaButton = document.createElement("button");
        excluirPartidaButton.innerText = "Excluir";
        excluirPartidaButton.setAttribute("id", "botaoExcluir");
        excluirPartidaButton.addEventListener("click", async () => {
            await excluirPartida(dado.id);
        })
        li.innerHTML = `
            <strong>Título:</strong> ${dado.titulo}
        `;
        li.style.color = "#FFF";
        li.appendChild(verDetalhes);
        li.appendChild(excluirPartidaButton);
        listaDePartidas.appendChild(li);
    })
}

async function carregarDadosDaAPI() {
    try {
        const response = await fetch('http://localhost:3000/partidas')
            .then(data => data.json())
            .catch((e) => {
                console.log(`Ocorreu um erro ao obter os dados da API: ${e.message}`);
            });
        return response;
    } catch (e) {
        console.log(`Ocorreu um erro: ${e.message}`);
    }
}

async function excluirPartida(id) {

    const response = await fetch(`http://localhost:3000/excluir/${id}`,
        {
            method: "POST"
        })
        .then(res => {
            window.location.href = '/';
        })
        .catch(e => console.log(e.message));

}

window.onload = () => {
    exibirListaDePartidas()
}