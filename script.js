// Botão do tema
const botaoTema = document.getElementById("botaoTema");
// Formulário
const formulario = document.getElementById("formulario");
// Campo de nome
const nomeUsuario = document.getElementById("nomeUsuario");
// Mensagem
const mensagem = document.getElementById("mensagem");

// Evento do modo escuro
botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("modo-escuro");
    if (document.body.classList.contains("modo-escuro")) {
        botaoTema.textContent = "Modo claro";
        botaoTema.style.borderColor = "var(--verde)";

    } else {
        botaoTema.textContent = "Modo escuro";
        botaoTema.style.borderColor = "var(--borda)";
    }

});

// Evento do formulário
formulario.addEventListener("submit", function (evento) {
    // Impede o recarregamento
    evento.preventDefault();

    // Pega o nome digitado
    const nome = nomeUsuario.value.trim();

    // Verifica se está vazio
    if (nome === "") {

        mensagem.textContent = "Digite seu nome para continuar.";

        mensagem.style.color = "#d45b5b";

        return;
    }

    // Salva o nome
    localStorage.setItem("nomeUsuario", nome);

    // Vai para a segunda página
    window.location.href = "projeto.html";

});