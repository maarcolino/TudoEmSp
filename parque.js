async function loadParques() {
    try {
        const response = await fetch('http://localhost:3000/parque');
        const eventos = await response.json();

        const eventList = document.getElementById('event-list');
        if (eventList) { // Verificar se o elemento existe antes de tentar manipular
            eventList.innerHTML = ''; // Limpar conteúdo existente

            eventos.forEach(evento => {
                const placeCard = document.createElement('a');
                placeCard.className = 'place-card';
                placeCard.href = `/evento.html?id=${evento._id}`; // Redirecionar para a página de detalhes com o ID do evento na URL
                placeCard.innerHTML = `
                    <img src="${evento.fotos && evento.fotos[0] ? evento.fotos[0] : './600x200.png'}" alt="${evento.nome}">
                    <h2>${evento.nome}</h2>
                    <p>${evento.descricao}</p>
                    <p>Data de início: ${evento.dataInicio}</p>
                    <p>Data de fim: ${evento.dataFim}</p>
                    <div class="details">
                        <span>Local: ${evento.local}</span>
                    </div>
                `;
                eventList.appendChild(placeCard);
            });
        }
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadParques();
});