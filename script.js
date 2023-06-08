document.addEventListener("DOMContentLoaded", function() {
    var lastQuestion = ''; // Armazena a última pergunta feita
    var lastAnswer = ''; // Armazena a última resposta recebida

    // Função para enviar a pergunta para a API
    function enviarPergunta(pergunta) {
        // Cria o objeto com os dados da pergunta
        var dados = {
            "pergunta": pergunta
        };

        // Faz a requisição POST para a rota '/pergunta-evento' da sua API
        fetch('http://localhost:5000/pergunta-evento', {  // Atualize a URL para o endereço correto da sua API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Armazena a resposta recebida
            lastAnswer = data.resposta;

            // Exibe a resposta do modelo na página
            exibirMensagem('assistant', lastAnswer);
        })
        .catch(function(error) {
            console.error('Erro:', error);
        });
    }

    // Função para exibir mensagens na interface do chat
    function exibirMensagem(papel, conteudo) {
        var chatBody = document.querySelector('.chat-body');

        // Cria o elemento de mensagem
        var mensagem = document.createElement('div');
        mensagem.className = 'message';

        // Define a classe da mensagem com base no papel
        if (papel === 'user') {
            mensagem.classList.add('user-message');
        } else if (papel === 'assistant') {
            mensagem.classList.add('assistant-message');
        }

        // Quebra as linhas no conteúdo da mensagem
        var linhas = conteudo.split('\n');
        for (var i = 0; i < linhas.length; i++) {
            var linha = document.createElement('div');
            linha.textContent = linhas[i];
            mensagem.appendChild(linha);

            // Adiciona uma quebra de linha adicional, exceto para a última linha
            if (i < linhas.length - 1) {
                var quebraDeLinha = document.createElement('br');
                mensagem.appendChild(quebraDeLinha);
            }
        }

        // Adiciona a mensagem ao corpo do chat
        chatBody.appendChild(mensagem);

        // Rola o chat para exibir a mensagem mais recente
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Função para tratar o envio do formulário
    function enviarFormulario(event) {
        event.preventDefault();

        // Obtém o valor do campo de texto
        var input = document.querySelector('#mensagem-input');
        var pergunta = input.value;

        // Verifica se a pergunta não está vazia
        if (pergunta.trim() === '') {
            return; // Retorna imediatamente se a pergunta estiver vazia
        }

        // Armazena a pergunta atual
        lastQuestion = pergunta;

        // Exibe a pergunta do usuário na interface
        exibirMensagem('user', pergunta);

        // Envia a pergunta para a API
        enviarPergunta(pergunta);

        // Limpa o campo de texto
        input.value = '';
    }

    // Função para ativar o reconhecimento de voz
    function ativarReconhecimentoVoz() {
        var recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.start();

        recognition.onresult = function(event) {
            var resultado = event.results[0][0].transcript;
            var input = document.querySelector('#mensagem-input');
            input.value = resultado;

            // Envia a pergunta para a API quando a transcrição estiver pronta
            enviarFormulario(event);
        };
    }

    // Função para regenerar a resposta da API
    function gerarNovamente() {
        // Verifica se há uma pergunta anterior e uma resposta anterior
        if (lastQuestion && lastAnswer) {
            // Remove a última resposta da interface
            var chatBody = document.querySelector('.chat-body');
            var lastAssistantMessage = chatBody.querySelector('.assistant-message:last-child');
            chatBody.removeChild(lastAssistantMessage);

            enviarPergunta(lastQuestion);
            // Limpa a última resposta exibida
            lastAnswer = '';
        }
    }

    // Adiciona o evento de envio do formulário ao botão 'Enviar'
    var enviarButton = document.querySelector('#enviar-button');
    enviarButton.addEventListener('click', enviarFormulario);

    // Adiciona o evento de envio do formulário ao pressionar Enter
    var inputText = document.querySelector('#mensagem-input');
    inputText.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            enviarFormulario(event);
        }
    });

    // Adiciona o evento de ativar reconhecimento de voz ao botão do microfone
    var microfoneButton = document.querySelector('#microfone-button');
    microfoneButton.addEventListener('click', ativarReconhecimentoVoz);

    // Adiciona o evento de gerar novamente ao botão "Gerar Novamente"
    var gerarNovamenteButton = document.querySelector('#regenerate-button');
    gerarNovamenteButton.addEventListener('click', gerarNovamente);
});
