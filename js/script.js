// --- FUNÇÕES DE CONTROLE DO POPUP ---
function abrirPopup() {
    document.getElementById("popup").style.display = "block";
    mostrarLogin(); 
}

function fecharPopup() {
    document.getElementById("popup").style.display = "none";
}

function fecharPopupClickFora(event) {
    if (event.target.id === 'popup') fecharPopup();
}

function mostrarCadastro() {
    document.getElementById("form-login").style.display = "none";
    document.getElementById("form-cadastro").style.display = "block";
    document.getElementById("popup-titulo").innerText = "Cadastre-se";
    document.getElementById("msg-cadastro").style.display = "none";
    limparCampos();
}

function mostrarLogin() {
    document.getElementById("form-cadastro").style.display = "none";
    document.getElementById("form-login").style.display = "block";
    document.getElementById("popup-titulo").innerText = "Acessar";
    document.getElementById("msg").style.display = "none";
    limparCampos();
}

function limparCampos() {
    document.getElementById("login-id").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("cad-login-id").value = "";
    document.getElementById("cad-senha").value = "";
    document.getElementById("senha").type = "password";
    document.getElementById("cad-senha").type = "password";
}

function toggleSenha(idInput) {
    const input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// --- FUNÇÕES DE AUTENTICAÇÃO E USUÁRIOS ---
function login() {
    const loginId = document.getElementById("login-id").value;
    const senha = document.getElementById("senha").value;
    const msgDiv = document.getElementById("msg");

    if (loginId === "admin" && senha === "admin") {
        window.location.href = "admin.html";
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioEncontrado = usuarios.find(u => u.login === loginId && u.senha === senha);

    if (usuarioEncontrado) {
        alert("Login realizado com sucesso!");
        fecharPopup();
    } else {
        msgDiv.innerText = "Credenciais inválidas.";
        msgDiv.style.color = "red";
        msgDiv.style.display = "block";
    }
}

function cadastrar() {
    const loginId = document.getElementById("cad-login-id").value;
    const senha = document.getElementById("cad-senha").value;
    const msgDiv = document.getElementById("msg-cadastro");

    if (!loginId || !senha) {
        msgDiv.innerText = "Preencha todos os campos.";
        msgDiv.style.color = "red";
        msgDiv.style.display = "block";
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (usuarios.find(u => u.login === loginId) || loginId === "admin") {
        msgDiv.innerText = "Este usuário já está cadastrado.";
        msgDiv.style.color = "red";
        msgDiv.style.display = "block";
        return;
    }

    usuarios.push({ login: loginId, senha: senha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    msgDiv.innerText = "Cadastro realizado com sucesso!";
    msgDiv.style.color = "green";
    msgDiv.style.display = "block";
    
    setTimeout(mostrarLogin, 1500);
}

function esqueciSenha() {
    const loginBusca = prompt("Digite seu E-mail ou CPF para recuperar a senha:");
    
    if (!loginBusca) return;

    if (loginBusca === "admin") {
        alert("A senha do administrador é: admin");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioEncontrado = usuarios.find(u => u.login === loginBusca);

    if (usuarioEncontrado) {
        alert("Senha recuperada: " + usuarioEncontrado.senha); 
    } else {
        alert("Usuário não encontrado.");
    }
}

// --- FUNÇÕES DE CURSOS ---
function salvarCurso() {
    const titulo = document.getElementById("titulo").value;
    const imagem = document.getElementById("imagem").value;

    if (!titulo || !imagem) {
        alert("Preencha todos os campos!");
        return;
    }

    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    cursos.push({ titulo, imagem });
    localStorage.setItem("cursos", JSON.stringify(cursos));

    alert("Curso cadastrado com sucesso!");
    document.getElementById("titulo").value = "";
    document.getElementById("imagem").value = "";
}

function carregarCursos() {
    const lista = document.getElementById("lista-cursos");
    if (!lista) return;

    let cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    lista.innerHTML = "";

    if (cursos.length === 0) {
        lista.innerHTML = "<p>Nenhum curso cadastrado no momento.</p>";
        return;
    }

    cursos.reverse().forEach(curso => {
        lista.innerHTML += `
            <div class="curso-card">
                <img class="curso-img" src="${curso.imagem}" alt="${curso.titulo}">
                <div class="curso-info">
                    <h3>${curso.titulo}</h3>
                </div>
            </div>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCursos();
});