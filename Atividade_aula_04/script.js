
// RECUPERAR REGISTROS DO LOCALSTORAGE


let registros =
    JSON.parse(
        localStorage.getItem("tarefas")
    ) || [];




//  ELEMENTOS DO HTML

const formulario =
    document.getElementById("formulario");

const listaAFazer =
    document.getElementById("aFazer");

const listaExecucao =
    document.getElementById("emExecucao");

const listaFinalizado =
    document.getElementById("finalizado");

const botaoLimpar =
    document.getElementById("limpar");

const totalTarefas =
    document.getElementById("totalTarefas");

const quantidadeAFazer =
    document.getElementById("quantidadeAFazer");

const quantidadeExecucao =
    document.getElementById("quantidadeExecucao");

const quantidadeFinalizado =
    document.getElementById("quantidadeFinalizado");




// SALVAR REGISTROS


function salvarRegistros() {

    localStorage.setItem(
        "tarefas",
        JSON.stringify(registros)
    );

}




//  MOSTRAR TAREFAS


function mostrarTarefas() {


    listaAFazer.innerHTML = "";

    listaExecucao.innerHTML = "";

    listaFinalizado.innerHTML = "";


    // Contadores

    let contadorAFazer = 0;

    let contadorExecucao = 0;

    let contadorFinalizado = 0;


    // PERCORRER ARRAY COM FOR...OF

    for (const registro of registros) {

        // Cria o card

        const tarefa =
            document.createElement("div");


        tarefa.classList.add("tarefa");


        // Define a cor da faixa de acordo com o status

        if (
            registro.status === "a-fazer"
        ) {

            tarefa.classList.add(
                "status-a-fazer"
            );

        } else if (
            registro.status === "em-execucao"
        ) {

            tarefa.classList.add(
                "status-em-execucao"
            );

        } else if (
            registro.status === "finalizado"
        ) {

            tarefa.classList.add(
                "status-finalizado"
            );

        }


        // Permite arrastar

        tarefa.setAttribute(
            "draggable",
            "true"
        );


        // Guarda o ID

        tarefa.dataset.id =
            registro.id;


        // DEFINIR COR DA PRIORIDADE

        let classePrioridade;


        if (
            registro.prioridade === "Alta"
        ) {

            classePrioridade =
                "prioridade-alta";

        } else if (
            registro.prioridade === "Média"
        ) {

            classePrioridade =
                "prioridade-media";

        } else {

            classePrioridade =
                "prioridade-baixa";

        }


        // CONTEÚDO DO CARD

        tarefa.innerHTML = `

            <h4>
                ${registro.tarefa}
            </h4>

            <p class="informacao">
                <strong>Dia:</strong>
                ${registro.dia}
            </p>

            <p class="informacao">
                <strong>Horário:</strong>
                ${registro.horario}
            </p>

            <span class="prioridade ${classePrioridade}">
                Prioridade: ${registro.prioridade}
            </span>

            <button
                class="botao-excluir"
                onclick="excluirTarefa(${registro.id})"
            >
                Excluir tarefa
            </button>

        `;



        // Eventos de arrastar

        tarefa.addEventListener(
            "dragstart",
            iniciarArraste
        );


        tarefa.addEventListener(
            "dragend",
            terminarArraste
        );


        // COLOCAR NA COLUNA CORRETA


        if (
            registro.status === "a-fazer"
        ) {

            listaAFazer.appendChild(
                tarefa
            );

            contadorAFazer++;


        } else if (
            registro.status === "em-execucao"
        ) {

            listaExecucao.appendChild(
                tarefa
            );

            contadorExecucao++;


        } else if (
            registro.status === "finalizado"
        ) {

            listaFinalizado.appendChild(
                tarefa
            );

            contadorFinalizado++;

        }

    }


    // ATUALIZAR CONTADORES

    quantidadeAFazer.textContent =
        contadorAFazer;

    quantidadeExecucao.textContent =
        contadorExecucao;

    quantidadeFinalizado.textContent =
        contadorFinalizado;

    totalTarefas.textContent =
        registros.length;


    // MENSAGENS DE COLUNAS VAZIAS

    if (contadorAFazer === 0) {

        listaAFazer.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma tarefa por fazer.
            </p>
        `;

    }


    if (contadorExecucao === 0) {

        listaExecucao.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma tarefa em execução.
            </p>
        `;

    }


    if (contadorFinalizado === 0) {

        listaFinalizado.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma tarefa finalizada.
            </p>
        `;

    }

}


// 5. CADASTRAR NOVA TAREFA

formulario.addEventListener(
    "submit",
    function(event) {

        // Evita recarregar a página

        event.preventDefault();



        // Captura os valores

        const dia =
            document.getElementById("dia").value;

        const tarefa =
            document.getElementById("tarefa").value;

        const horario =
            document.getElementById("horario").value;

        const prioridade =
            document.getElementById("prioridade").value;


        // CRIAR OBJETO

        const novoRegistro = {

            id: Date.now(),

            dia: dia,

            tarefa: tarefa,

            horario: horario,

            prioridade: prioridade,

            status: "a-fazer"

        };



        // Adiciona o objeto ao array

        registros.push(
            novoRegistro
        );



        // Salva no localStorage

        salvarRegistros();



        // Atualiza a tela

        mostrarTarefas();



        // Limpa o formulário

        formulario.reset();

    }
);


// 6. INICIAR ARRASTE

function iniciarArraste(event) {

    const tarefa =
        event.currentTarget;


    tarefa.classList.add(
        "arrastando"
    );


    event.dataTransfer.setData(
        "text/plain",
        tarefa.dataset.id
    );


    event.dataTransfer.effectAllowed =
        "move";

}



// 7. TERMINAR ARRASTE

function terminarArraste(event) {

    event.currentTarget.classList.remove(
        "arrastando"
    );

}



// 8. CONFIGURAR ÁREAS DE DROP

const colunas =
    document.querySelectorAll(
        ".area-tarefas"
    );



for (const coluna of colunas) {


    // Quando arrasta por cima

    coluna.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

            coluna.classList.add(
                "arrastando-sobre"
            );

        }
    );



    // Quando sai da área

    coluna.addEventListener(
        "dragleave",
        function() {

            coluna.classList.remove(
                "arrastando-sobre"
            );

        }
    );



    // Quando solta

    coluna.addEventListener(
        "drop",
        function(event) {

            event.preventDefault();


            coluna.classList.remove(
                "arrastando-sobre"
            );



            // Recupera o ID

            const id =
                Number(
                    event.dataTransfer.getData(
                        "text/plain"
                    )
                );



            // Descobre o status da coluna

            const novoStatus =
                coluna.parentElement.dataset.status;



            // Procura o objeto

            for (const registro of registros) {

                if (
                    registro.id === id
                ) {

                    registro.status =
                        novoStatus;

                    break;

                }

            }



            // Salva a alteração

            salvarRegistros();



            // Atualiza a tela

            mostrarTarefas();

        }
    );

}


// 9. EXCLUIR TAREFA

function excluirTarefa(id) {

    registros =
        registros.filter(
            function(registro) {

                return registro.id !== id;

            }
        );


    salvarRegistros();


    mostrarTarefas();

}



// 10. LIMPAR TODAS AS TAREFAS

botaoLimpar.addEventListener(
    "click",
    function() {


        if (
            registros.length === 0
        ) {

            alert(
                "Não existem tarefas cadastradas."
            );

            return;

        }



        const confirmar =
            confirm(
                "Tem certeza que deseja apagar todas as tarefas?"
            );



        if (confirmar) {

            registros = [];


            salvarRegistros();


            mostrarTarefas();

        }

    }
);


// 11. MOSTRAR TAREFAS AO ABRIR A PÁGINA

mostrarTarefas();