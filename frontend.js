// Simulação de autenticação e interação com o backend
let currentUser = null;

// Elementos DOM
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authConfirmPassword = document.getElementById("auth-confirm-password");
const authSubmit = document.getElementById("auth-submit");
const toggleAuth = document.getElementById("toggle-auth");
const addBoxButton = document.getElementById("add-box");
const userDisplay = document.getElementById("user-display");
const searchBox = document.getElementById("search-box");
const boxContainer = document.getElementById("box-container");
const boxModal = document.getElementById("box-modal");
const boxTitle = document.getElementById("box-title");
const boxDescription = document.getElementById("box-description");
const boxLanguage = document.getElementById("box-language");
const boxCode = document.getElementById("box-code");
const saveBox = document.getElementById("save-box");

// Variável para rastrear o estado de autenticação (login/registro)
let isSignIn = false;

// Funções
function toggleAuthMode() {
  isSignIn = !isSignIn;
  authTitle.textContent = isSignIn ? "Criar Conta" : "Login";
  authConfirmPassword.classList.toggle("hidden", !isSignIn);
  authSubmit.textContent = isSignIn ? "Registrar" : "Entrar";
  toggleAuth.textContent = isSignIn ? "Já tem uma conta? Faça login" : "Criar conta";
}

function showAuthModal() {
  authModal.classList.remove("hidden");
}

function hideAuthModal() {
  authModal.classList.add("hidden");
}

function showBoxModal() {
  boxModal.classList.remove("hidden");
}

function hideBoxModal() {
  boxModal.classList.add("hidden");
}

function updateUIAfterLogin(user) {
  currentUser = user;
  userDisplay.textContent = `Olá, ${user.username}`;
  addBoxButton.classList.remove("hidden");
  hideAuthModal();
}

function loadBoxes(query = "") {
  // Simular uma busca de caixas no backend
  fetch(`/search?query=${query}&userId=${currentUser.id}`)
    .then((res) => res.json())
    .then((boxes) => {
      boxContainer.innerHTML = "";
      boxes.forEach((box) => {
        const boxElement = document.createElement("div");
        boxElement.className = "border p-4 rounded-md shadow-md bg-white";
        boxElement.innerHTML = `
          <h2 class="text-lg font-bold">${box.title}</h2>
          <p class="text-gray-600">${box.description}</p>
          <p class="text-sm text-blue-500">${box.language}</p>
        `;
        boxContainer.appendChild(boxElement);
      });
    })
    .catch((err) => console.error("Erro ao carregar caixas:", err));
}

function addBox() {
  const boxData = {
    title: boxTitle.value,
    description: boxDescription.value,
    language: boxLanguage.value,
    code: boxCode.value,
    userId: currentUser.id,
  };

  fetch("/add-box", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boxData),
  })
    .then((res) => res.text())
    .then((message) => {
      alert(message);
      loadBoxes();
      hideBoxModal();
    })
    .catch((err) => console.error("Erro ao adicionar caixa:", err));
}

// Eventos
authSubmit.addEventListener("click", () => {
  const username = authUsername.value.trim();
  const password = authPassword.value.trim();

  if (!username || !password) {
    return alert("Preencha todos os campos.");
  }

  if (isSignIn) {
    const confirmPassword = authConfirmPassword.value.trim();
    if (password !== confirmPassword) {
      return alert("As senhas não coincidem.");
    }

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, confirmPassword }),
    })
      .then((res) => res.text())
      .then((message) => {
        alert(message);
        toggleAuthMode();
      })
      .catch((err) => console.error("Erro ao registrar:", err));
  } else {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((user) => updateUIAfterLogin(user))
      .catch((err) => alert("Erro ao fazer login: " + err.message));
  }
});

toggleAuth.addEventListener("click", toggleAuthMode);

addBoxButton.addEventListener("click", showBoxModal);
saveBox.addEventListener("click", addBox);

searchBox.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  loadBoxes(query);
});

// Inicializar
showAuthModal();
