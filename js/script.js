// --- FUNÇÃO AUXILIAR: CONVERSOR AUTOMÁTICO DO GOOGLE DRIVE ---
function converterLinkDrive(url) {
    if (!url) return url;
    const regExp = /\/file\/d\/([^\/]+)|id=([^&]+)/;
    const matches = url.match(regExp);
    if (matches) {
        const id = matches[1] || matches[2];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
}

// --- FUNÇÕES DE CONTROLE DO POPUP ---
function abrirPopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "block";
        mostrarLogin(); 
    }
}

// --- MANUTENÇÃO DE INTERFACE ---
function fecharPopup() {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
}

function fecharPopupClickFora(event) {
    if (event.target.id === 'popup') fecharPopup();
}

function mostrarCadastro() {
    const formLogin = document.getElementById("form-login");
    const formCad = document.getElementById("form-cadastro");
    const titulo = document.getElementById("popup-titulo");
    const msgCad = document.getElementById("msg-cadastro");

    if (formLogin) formLogin.style.display = "none";
    if (formCad) formCad.style.display = "block";
    if (titulo) titulo.innerText = "Cadastre-se";
    if (msgCad) msgCad.style.display = "none";
    limparCampos();
}

function mostrarLogin() {
    const formLogin = document.getElementById("form-login");
    const formCad = document.getElementById("form-cadastro");
    const titulo = document.getElementById("popup-titulo");
    const msg = document.getElementById("msg");

    if (formCad) formCad.style.display = "none";
    if (formLogin) formLogin.style.display = "block";
    if (titulo) titulo.innerText = "Acessar";
    if (msg) msg.style.display = "none";
    limparCampos();
}

function limparCampos() {
    const campos = ["login-id", "senha", "cad-nome", "cad-cpf", "cad-email", "cad-celular", "cad-funcao", "cad-senha"];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    
    const senha = document.getElementById("senha");
    const cadSenha = document.getElementById("cad-senha");
    if (senha) senha.type = "password";
    if (cadSenha) cadSenha.type = "password";
}

function toggleSenha(idInput) {
    const input = document.getElementById(idInput);
    if (input) {
        input.type = input.type === "password" ? "text" : "password";
    }
}

// --- SESSÃO DO USUÁRIO ---
function verificarSessao() {
    const usuarioStorage = localStorage.getItem("usuarioLogado");
    const btnLogin = document.getElementById("btn-header-login");
    const areaLogado = document.getElementById("area-usuario-logado");
    const nomeUsuario = document.getElementById("nome-usuario-header");

    if (usuarioStorage && btnLogin && areaLogado && nomeUsuario) {
        let usuarioLogado;
        try {
            usuarioLogado = JSON.parse(usuarioStorage);
        } catch (e) {
            usuarioLogado = { nome: usuarioStorage, funcao: null };
        }
        
        btnLogin.style.display = "none";
        areaLogado.style.display = "inline-flex"; // Alterado para inline-flex para não quebrar o layout do menu
        nomeUsuario.innerText = "Olá, " + usuarioLogado.nome.split(" ")[0];
    } else if (btnLogin && areaLogado) {
        btnLogin.style.display = "block";
        areaLogado.style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    verificarSessao();
    carregarCursos();
}

// --- FUNÇÕES DE AUTENTICAÇÃO E USUÁRIOS ---
function login() {
    const loginIdEl = document.getElementById("login-id");
    const senhaEl = document.getElementById("senha");
    const msgDiv = document.getElementById("msg");

    if (!loginIdEl || !senhaEl) return;

    const loginId = loginIdEl.value;
    const senha = senhaEl.value;

    if (loginId === "admin" && senha === "admin") {
        window.location.href = "admin.html";
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioEncontrado = usuarios.find(u => u.cpf === loginId && u.senha === senha);

    if (usuarioEncontrado) {
        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: usuarioEncontrado.nome,
            cpf: usuarioEncontrado.cpf,
            funcao: usuarioEncontrado.funcao
        }));
        verificarSessao();
        fecharPopup();
        
        // Verifica se existia alguma conclusão de QR Code pendente pré-login
        const pendente = localStorage.getItem("pendenteConcluir");
        if (pendente !== null) {
            processarConclusao(parseInt(pendente));
            localStorage.removeItem("pendenteConcluir");
        } else {
            carregarCursos();
        }
    } else {
        if (msgDiv) {
            msgDiv.innerText = "CPF ou senha inválidos.";
            msgDiv.style.color = "red";
            msgDiv.style.display = "block";
        }
    }
}

function cadastrar() {
    const nome = document.getElementById("cad-nome")?.value;
    const cpf = document.getElementById("cad-cpf")?.value;
    const email = document.getElementById("cad-email")?.value;
    const celular = document.getElementById("cad-celular")?.value;
    const funcao = document.getElementById("cad-funcao")?.value;
    const senha = document.getElementById("cad-senha")?.value;
    const msgDiv = document.getElementById("msg-cadastro");

    if (!nome || !cpf || !email || !celular || !funcao || !senha) {
        if (msgDiv) {
            msgDiv.innerText = "Preencha todos os campos.";
            msgDiv.style.color = "red";
            msgDiv.style.display = "block";
        }
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (usuarios.find(u => u.cpf === cpf) || cpf === "admin") {
        if (msgDiv) {
            msgDiv.innerText = "Este CPF já está cadastrado.";
            msgDiv.style.color = "red";
            msgDiv.style.display = "block";
        }
        return;
    }

    usuarios.push({ nome, cpf, email, celular, funcao, senha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    if (msgDiv) {
        msgDiv.innerText = "Cadastro realizado com sucesso!";
        msgDiv.style.color = "green";
        msgDiv.style.display = "block";
    }
    
    setTimeout(mostrarLogin, 1500);
}

function esqueciSenha() {
    const loginBusca = prompt("Digite seu CPF para recuperar a senha:");
    if (!loginBusca) return;

    if (loginBusca === "admin") {
        alert("A senha do administrador é: admin");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioEncontrado = usuarios.find(u => u.cpf === loginBusca);

    if (usuarioEncontrado) {
        alert("Sua senha é: " + usuarioEncontrado.senha); 
    } else {
        alert("CPF não encontrado.");
    }
}

// --- PROCESSAMENTO DE INSCRIÇÃO E LOG DE CONCLUSÃO ---
function inscreverCurso(index) {
    const usuarioStorage = localStorage.getItem("usuarioLogado");
    if (!usuarioStorage) {
        alert("Você precisa fazer login para se inscrever.");
        abrirPopup();
        return;
    }

    const userObj = JSON.parse(usuarioStorage);
    let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];

    const jaMatriculado = matriculas.find(m => m.cpf === userObj.cpf && m.cursoIndex === index);
    if (jaMatriculado) {
        alert("Você já está inscrito neste curso.");
        return;
    }

    matriculas.push({ cpf: userObj.cpf, cursoIndex: index, status: "Inscrito" });
    localStorage.setItem("matriculas", JSON.stringify(matriculas));
    
    alert("Inscrição realizada com sucesso!");
    carregarCursos();
}

function acessarCurso(event, link) {
    event.preventDefault();
    if (!link) {
        alert("O material técnico ainda não foi disponibilizado pelo administrador.");
        return;
    }
    window.open(link, '_blank');
}

function processarConclusao(index) {
    const usuarioStorage = localStorage.getItem("usuarioLogado");
    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    
    if (!cursos[index]) {
        alert("Curso inválido.");
        window.location.href = "index.html";
        return;
    }

    if (!usuarioStorage) {
        alert("Identificamos o QR Code de conclusão! Por favor, faça login primeiro para validar o seu certificado.");
        localStorage.setItem("pendenteConcluir", index);
        abrirPopup();
        return;
    }

    const userObj = JSON.parse(usuarioStorage);
    let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];
    let mIndex = matriculas.findIndex(m => m.cpf === userObj.cpf && m.cursoIndex === index);

    if (mIndex !== -1) {
        matriculas[mIndex].status = "Concluído";
    } else {
        matriculas.push({ cpf: userObj.cpf, cursoIndex: index, status: "Concluído" });
    }

    localStorage.setItem("matriculas", JSON.stringify(matriculas));
    alert(`Parabéns! Sua presença e conclusão no curso "${cursos[index].titulo}" foram registradas com sucesso!`);
    
    window.history.replaceState({}, document.title, window.location.pathname);
    carregarCursos();
}

// --- FUNÇÕES DE CURSOS ---
function salvarCurso() {
    const tituloEl = document.getElementById("titulo");
    let imagemEl = document.getElementById("imagem");
    const cargaHorariaEl = document.getElementById("carga-horaria");
    const dataInicioEl = document.getElementById("data-inicio");
    const dataFimEl = document.getElementById("data-fim");
    const linkConteudoEl = document.getElementById("link-conteudo");

    if (!tituloEl || !imagemEl || !cargaHorariaEl || !dataInicioEl || !dataFimEl || !linkConteudoEl) return;

    const titulo = tituloEl.value;
    let imagem = converterLinkDrive(imagemEl.value);
    const cargaHoraria = cargaHorariaEl.value;
    const dataInicio = dataInicioEl.value;
    const dataFim = dataFimEl.value;
    const linkConteudo = linkConteudoEl.value;

    const checkboxes = document.querySelectorAll('#funcoes-permitidas input[type="checkbox"]:checked');
    const publicoAlvo = Array.from(checkboxes).map(cb => cb.value);

    if (!titulo || !imagem || !cargaHoraria || !dataInicio || !dataFim) {
        alert("Preencha todos os campos obrigatórios (Título, Imagem, Carga Horária e Período)!");
        return;
    }

    if (publicoAlvo.length === 0) {
        alert("Selecione pelo menos um público-alvo para o curso!");
        return;
    }

    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    cursos.push({ titulo, imagem, cargaHoraria, dataInicio, dataFim, linkConteudo, publicoAlvo });
    localStorage.setItem("cursos", JSON.stringify(cursos));

    alert("Curso cadastrado com sucesso!");
    tituloEl.value = "";
    imagemEl.value = "";
    cargaHorariaEl.value = "";
    dataInicioEl.value = "";
    dataFimEl.value = "";
    linkConteudoEl.value = "";
    
    checkboxes.forEach(cb => cb.checked = false);

    carregarCursosAdmin();
}

function carregarCursos() {
    const lista = document.getElementById("lista-cursos");
    if (!lista) return;

    lista.innerHTML = "";
    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];
    const usuarioStorage = localStorage.getItem("usuarioLogado");
    
    let funcaoUsuario = null;
    let cpfUsuario = null;
    
    if (usuarioStorage) {
        try {
            let userObj = JSON.parse(usuarioStorage);
            funcaoUsuario = userObj.funcao;
            cpfUsuario = userObj.cpf;
        } catch(e) {
            funcaoUsuario = null;
        }
    }

    let cursosVisiveis = cursos;
    if (funcaoUsuario) {
        cursosVisiveis = cursos.filter(curso => {
            if (!curso.publicoAlvo || curso.publicoAlvo.length === 0) return true;
            return curso.publicoAlvo.includes(funcaoUsuario);
        });
    }

    if (cursosVisiveis.length === 0) {
        lista.innerHTML = "<p style='text-align: center; width: 100%; color: #666;'>Nenhum curso disponível no momento.</p>";
        return;
    }

    cursosVisiveis.reverse().forEach((curso) => {
        const indexReal = cursos.indexOf(curso);
        const urlImagemFinal = converterLinkDrive(curso.imagem);
        
        let mReg = cpfUsuario ? matriculas.find(m => m.cpf === cpfUsuario && m.cursoIndex === indexReal) : null;
        
        let areaAcaoHtml = "";
        if (!usuarioStorage) {
            areaAcaoHtml = `<button onclick="abrirPopup()" class="btn-acessar-curso">Inscrever-se</button>`;
        } else if (!mReg) {
            areaAcaoHtml = `<button onclick="inscreverCurso(${indexReal})" class="btn-acessar-curso">Inscrever-se</button>`;
        } else if (mReg.status === "Inscrito") {
            if (curso.linkConteudo) {
                areaAcaoHtml = `<span style="color:#28a745; font-weight:bold; display:block; margin-bottom:10px;">✔ Você está Inscrito</span>
                                <button onclick="acessarCurso(event, '${curso.linkConteudo}')" class="btn-acessar-curso">Acessar Conteúdo</button>`;
            } else {
                areaAcaoHtml = `<span style="color:#f39c12; font-weight:bold; display:block; margin-bottom:10px;">✔ Vaga Garantida (Presencial)</span>
                                <button class="btn-acessar-curso" style="background:#ccc; cursor:not-allowed;" disabled>Material Indisponível</button>`;
            }
        } else if (mReg.status === "Concluído") {
            let btnAcessoHtml = curso.linkConteudo 
                ? `<button onclick="acessarCurso(event, '${curso.linkConteudo}')" class="btn-acessar-curso">Ver Slides / Material</button>`
                : `<button class="btn-acessar-curso" style="background:#ccc; cursor:not-allowed;" disabled>Material Indisponível</button>`;
            
            areaAcaoHtml = `<span style="color:#007bff; font-weight:bold; display:block; margin-bottom:10px;">⭐ Curso Concluído</span> ${btnAcessoHtml}`;
        }

        lista.innerHTML += `
            <div class="curso-card">
                <img class="curso-img" src="${urlImagemFinal}" alt="${curso.titulo}">
                <div class="curso-info">
                    <h3>${curso.titulo}</h3>
                    <p><strong>Carga Horária:</strong> ${curso.cargaHoraria}</p>
                    <p><strong>Período:</strong> ${curso.dataInicio} a ${curso.dataFim}</p>
                    ${areaAcaoHtml}
                </div>
            </div>
        `;
    });
}

// --- FUNÇÕES EXCLUSIVAS DO ADMINISTRADOR ---
function carregarCursosAdmin() {
    const listaAdmin = document.getElementById("lista-cursos-admin");
    if (!listaAdmin) return;

    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];
    listaAdmin.innerHTML = "";

    if (cursos.length === 0) {
        listaAdmin.innerHTML = "<p style='color: #666;'>Nenhum curso cadastrado.</p>";
        return;
    }

    cursos.forEach((curso, index) => {
        let publico = curso.publicoAlvo ? curso.publicoAlvo.join(", ") : "Todos";
        let totalInscritos = matriculas.filter(m => m.cursoIndex === index).length;
        
        listaAdmin.innerHTML += `
            <div style="background:#f9f9f9; padding:15px; margin-bottom:15px; border-radius:6px; border:1px solid #ddd; text-align:left;">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; margin-bottom:10px;">
                    <span>
                        <strong style="font-size:16px; color:#333;">${curso.titulo}</strong> (${curso.cargaHoraria})<br>
                        <small style="color:#666;">Público: ${publico} | <strong>Inscritos: ${totalInscritos}</strong></small>
                    </span>
                    <div>
                        <button onclick="abrirModalQr(${index}, '${curso.titulo}')" style="background:#17a2b8; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; margin-right:5px;">Gerar QR Code</button>
                        <button onclick="imprimirListaPresenca(${index})" style="background:#28a745; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; margin-right:5px;">Imprimir Lista</button>
                        <button onclick="excluirCurso(${index})" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">Excluir</button>
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <input type="text" id="link-atualizar-${index}" placeholder="Inserir ou atualizar Link do Material/Slides" value="${curso.linkConteudo || ''}" style="flex:1; padding:6px; font-size:13px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="atualizarLinkMaterial(${index})" style="background:#007bff; color:white; border:none; padding:6px 15px; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;">Atualizar Material</button>
                </div>
            </div>
        `;
    });
}

function atualizarLinkMaterial(index) {
    const input = document.getElementById(`link-atualizar-${index}`);
    if (!input) return;

    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    cursos[index].linkConteudo = input.value;
    
    localStorage.setItem("cursos", JSON.stringify(cursos));
    alert("Link do material updated com sucesso!");
    carregarCursosAdmin();
}

function imprimirListaPresenca(index) {
    let SampleCursos = JSON.parse(localStorage.getItem("cursos")) || [];
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];

    let curso = SampleCursos[index];
    let inscritos = matriculas.filter(m => m.cursoIndex === index);

    if (inscritos.length === 0) {
        alert("Não há alunos inscritos neste curso para gerar a lista.");
        return;
    }

    let janelaImpressao = window.open('', '', 'width=900,height=600');
    let conteudoHtml = `
        <html>
        <head>
            <title>Lista de Presença - ${curso.titulo}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color:#333; }
                h2 { text-align: center; margin-bottom: 5px; }
                p { text-align: center; margin-top: 0; font-size: 14px; margin-bottom:20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #333; padding: 10px; text-align: left; font-size: 13px; }
                th { background-color: #eee; }
                .assinatura { width: 250px; }
            </style>
        </head>
        <body>
            <h2>Lista de Presença - Aula Presencial</h2>
            <p><strong>Curso:</strong> ${curso.titulo} | <strong>Período:</strong> ${curso.dataInicio} a ${curso.dataFim} | <strong>Carga Horária:</strong> ${curso.cargaHoraria}</p>
            <table>
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nome Completo</th>
                        <th>CPF</th>
                        <th>Função</th>
                        <th class="assinatura">Assinatura do Participante</th>
                    </tr>
                </thead>
                <tbody>
    `;

    inscritos.forEach((m, i) => {
        let dadosUser = usuarios.find(u => u.cpf === m.cpf) || { nome: "Não encontrado", funcao: "—" };
        conteudoHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${dadosUser.nome}</td>
                <td>${m.cpf}</td>
                <td>${dadosUser.funcao}</td>
                <td></td>
            </tr>
        `;
    });

    conteudoHtml += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    janelaImpressao.document.write(conteudoHtml);
    janelaImpressao.document.close();
    janelaImpressao.print();
}

function abrirModalQr(index, titulo) {
    const modal = document.getElementById("modal-qrcode");
    const container = document.getElementById("qr-container");
    const tituloQr = document.getElementById("qr-titulo");

    if (!modal || !container) return;

    const linkConclusao = window.location.origin + window.location.pathname.replace("admin.html", "index.html") + "?concluir=" + index;
    
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkConclusao)}" alt="QR Code">`;
    tituloQr.innerText = titulo;
    modal.style.display = "flex";
}

function fecharModalQr() {
    const modal = document.getElementById("modal-qrcode");
    if (modal) modal.style.display = "none";
}

function excluirCurso(index) {
    if (confirm("Deseja realmente excluir este curso? Todas as matrículas dele sumirão.")) {
        let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
        let matriculas = JSON.parse(localStorage.getItem("matriculas")) || [];
        
        cursos.splice(index, 1);
        matriculas = matriculas.filter(m => m.cursoIndex !== index);
        
        localStorage.setItem("cursos", JSON.stringify(cursos));
        localStorage.setItem("matriculas", JSON.stringify(matriculas));
        carregarCursosAdmin();
    }
}

// --- MONITORAMENTO DE PARÂMETROS DE URL (QR CODE) ---
document.addEventListener("DOMContentLoaded", () => {
    carregarCursos();
    carregarCursosAdmin();
    verificarSessao();

    const urlParams = new URLSearchParams(window.location.search);
    const concluirIndex = urlParams.get('concluir');
    if (concluirIndex !== null) {
        processarConclusao(parseInt(concluirIndex));
    }
});