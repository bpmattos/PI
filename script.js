/* =========================================================
   enJoy English School — Painel de Alunos
   Model (dados) + View (renderização) + Controller (eventos)
   simulados em JavaScript Vanilla, sem back-end.

   As regras de validação (CPF, e-mail, telefone) replicam
   fielmente a lógica de Validador.cs do sistema real (Windows
   Forms / ASP.NET MVC), para manter consistência entre as
   3 aplicações do Projeto Integrador enJoy.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. MODEL — dados em memória (nenhuma persistência real,
        pois este front-end é estático e independente do MVC)
     --------------------------------------------------------- */
  const NIVEIS = ['Iniciante', 'Básico', 'Intermediário', 'Avançado'];

  const NIVEL_COR = {
    'Iniciante': { bg: 'rgba(242,80,63,0.12)', text: '#B8362A', dot: 'var(--lvl-iniciante)' },
    'Básico': { bg: 'rgba(240,160,48,0.14)', text: '#8A5A12', dot: 'var(--lvl-basico)' },
    'Intermediário': { bg: 'rgba(240,208,64,0.18)', text: '#7A6412', dot: 'var(--lvl-intermediario)' },
    'Avançado': { bg: 'rgba(147,198,103,0.18)', text: '#3E6B24', dot: 'var(--lvl-avancado)' }
  };

  let proximoId = 5;

  let alunos = [
    { id: 1, tipoAluno: 'Adulto', cpf: '52998224725', nome: 'Ana Souza', endereco: 'Rua das Flores, 120', cep: '06010000', uf: 'SP', telResidencial: '', telCelular: '11987654321', email: 'ana.souza@email.com', nivelIngles: 'Intermediário', foto: 'img/menina.png' },
    { id: 2, tipoAluno: 'Adolescente', cpf: '11144477735', nome: 'Bruno Lima', endereco: 'Av. Central, 45', cep: '06020000', uf: 'SP', telResidencial: '1133221100', telCelular: '11991112222', email: 'bruno.lima@email.com', nivelIngles: 'Iniciante', foto: 'img/imagemingles.jpg' },
    { id: 3, tipoAluno: 'Adulto', cpf: '93541134780', nome: 'Camila Reis', endereco: 'Rua Osasco, 900', cep: '06030000', uf: 'SP', telResidencial: '', telCelular: '11933334444', email: 'camila.reis@email.com', nivelIngles: 'Avançado', foto: 'img/shutterstock_CDgbBvH.jpg' },
    { id: 4, tipoAluno: 'Infantil', cpf: '71428793860', nome: 'Diego Martins', endereco: 'Rua Carapicuíba, 15', cep: '06040000', uf: 'SP', telResidencial: '', telCelular: '11955556666', email: 'diego.martins@email.com', nivelIngles: 'Básico', foto: 'img/tela.jpg' }
  ];

  let filtroAtual = 'Todos';
  let termoBusca = '';
  let idParaExcluir = null;

  /* ---------------------------------------------------------
     2. VALIDAÇÕES — mesmas regras de Validador.cs
     --------------------------------------------------------- */
  const Validador = {
    somenteDigitos(valor) {
      return (valor || '').replace(/\D/g, '');
    },

    // Algoritmo oficial de módulo 11, idêntico ao usado no
    // Windows Forms / MVC do projeto.
    validarCPF(valorDigitado) {
      const cpf = Validador.somenteDigitos(valorDigitado);
      if (cpf.length !== 11) return false;
      if (new Set(cpf.split('')).size === 1) return false;

      const mult1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
      const mult2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

      let tempCpf = cpf.substring(0, 9);
      let soma = 0;
      for (let i = 0; i < 9; i++) soma += Number(tempCpf[i]) * mult1[i];
      let resto = soma % 11;
      resto = resto < 2 ? 0 : 11 - resto;
      let digito = String(resto);

      tempCpf += digito;
      soma = 0;
      for (let i = 0; i < 10; i++) soma += Number(tempCpf[i]) * mult2[i];
      resto = soma % 11;
      resto = resto < 2 ? 0 : 11 - resto;
      digito += String(resto);

      return cpf.endsWith(digito);
    },

    validarEmail(email) {
      if (!email || !email.trim()) return false;
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    },

    validarTelefone(telefone, obrigatorio) {
      const digitos = Validador.somenteDigitos(telefone);
      if (!digitos) return !obrigatorio;
      return digitos.length === 10 || digitos.length === 11;
    },

    validarCep(cep) {
      return Validador.somenteDigitos(cep).length === 8;
    }
  };

  function formatarCPF(digitos) {
    const d = Validador.somenteDigitos(digitos).slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function formatarTelefone(digitos) {
    const d = Validador.somenteDigitos(digitos).slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
  }
  function formatarCep(digitos) {
    const d = Validador.somenteDigitos(digitos).slice(0, 8);
    return d.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  }

  /* ---------------------------------------------------------
     3. DOM refs
     --------------------------------------------------------- */
  const form = document.getElementById('studentForm');
  const campo = {
    id: document.getElementById('studentId'),
    tipoAluno: document.getElementById('tipoAluno'),
    nome: document.getElementById('nome'),
    cpf: document.getElementById('cpf'),
    email: document.getElementById('email'),
    telCelular: document.getElementById('telCelular'),
    telResidencial: document.getElementById('telResidencial'),
    endereco: document.getElementById('endereco'),
    cep: document.getElementById('cep'),
    uf: document.getElementById('uf'),
    nivelIngles: document.getElementById('nivelIngles'),
    senha: document.getElementById('senha'),
    confirmarSenha: document.getElementById('confirmarSenha')
  };
  const fotoInput = document.getElementById('fotoInput');
  const fotoPreview = document.getElementById('fotoPreview');
  let fotoAtualDataUrl = null;

  const statsRow = document.getElementById('statsRow');
  const studentsGrid = document.getElementById('studentsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.getElementById('filterButtons');
  const toast = document.getElementById('toast');

  const modal = document.getElementById('confirmModal');
  const modalText = document.getElementById('modalText');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');

  const navToggle = document.getElementById('navToggle');
  const headerNav = document.getElementById('headerNav');

  /* ---------------------------------------------------------
     4. VIEW — renderização
     --------------------------------------------------------- */
  function renderStats() {
    const total = alunos.length;
    const porNivel = NIVEIS.reduce((acc, n) => {
      acc[n] = alunos.filter(a => a.nivelIngles === n).length;
      return acc;
    }, {});
    const nivelDestaque = NIVEIS.reduce((a, b) => (porNivel[a] >= porNivel[b] ? a : b));

    statsRow.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__value">${total}</div>
        <div class="stat-card__label">Alunos matriculados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${porNivel['Avançado']}</div>
        <div class="stat-card__label">No nível Avançado</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${porNivel['Iniciante']}</div>
        <div class="stat-card__label">No nível Iniciante</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">${nivelDestaque}</div>
        <div class="stat-card__label">Nível mais frequente</div>
      </div>
    `;
  }

  function listaFiltrada() {
    return alunos.filter(a => {
      const passaFiltro = filtroAtual === 'Todos' || a.nivelIngles === filtroAtual;
      const termo = termoBusca.trim().toLowerCase();
      const passaBusca = !termo ||
        a.nome.toLowerCase().includes(termo) ||
        Validador.somenteDigitos(a.cpf).includes(Validador.somenteDigitos(termo));
      return passaFiltro && passaBusca;
    });
  }

  function renderGrid() {
    const lista = listaFiltrada();
    resultsCount.textContent = `${lista.length} aluno(s) encontrado(s)`;

    if (lista.length === 0) {
      studentsGrid.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    studentsGrid.innerHTML = lista.map(a => {
      const cor = NIVEL_COR[a.nivelIngles] || NIVEL_COR['Iniciante'];
      return `
        <article class="student-card" data-id="${a.id}">
          <div class="student-card__top">
            <img class="student-card__photo" src="${a.foto || 'img/menina.png'}" alt="Foto de ${a.nome}">
            <div>
              <p class="student-card__name">${a.nome}</p>
              <p class="student-card__type">${a.tipoAluno} · ${a.uf}</p>
            </div>
          </div>

          <span class="student-card__level" style="background:${cor.bg}; color:${cor.text};">
            <span class="student-card__level-dot" style="background:${cor.dot};"></span>
            ${a.nivelIngles}
          </span>

          <div class="student-card__meta">
            <span>CPF: ${formatarCPF(a.cpf)}</span>
            <span>${a.email}</span>
            <span>${formatarTelefone(a.telCelular)}</span>
          </div>

          <div class="student-card__actions">
            <button class="btn btn--ghost btn--small" data-action="editar" data-id="${a.id}">Editar</button>
            <button class="btn btn--danger btn--small" data-action="excluir" data-id="${a.id}">Excluir</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderTudo() {
    renderStats();
    renderGrid();
  }

  function mostrarToast(mensagem, tipoErro) {
    toast.textContent = mensagem;
    toast.className = 'toast' + (tipoErro ? ' toast--error' : '');
    toast.hidden = false;
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function mostrarErro(campoId, mensagem) {
    const span = form.querySelector(`[data-error-for="${campoId}"]`);
    const input = campo[campoId];
    if (span) span.textContent = mensagem || '';
    if (input) input.classList.toggle('is-invalid', Boolean(mensagem));
  }

  function limparErros() {
    form.querySelectorAll('.form__error').forEach(s => s.textContent = '');
    form.querySelectorAll('.form__input').forEach(i => i.classList.remove('is-invalid'));
  }

  /* ---------------------------------------------------------
     5. CONTROLLER — máscaras em tempo real
     --------------------------------------------------------- */
  campo.cpf.addEventListener('input', () => { campo.cpf.value = formatarCPF(campo.cpf.value); });
  campo.telCelular.addEventListener('input', () => { campo.telCelular.value = formatarTelefone(campo.telCelular.value); });
  campo.telResidencial.addEventListener('input', () => { campo.telResidencial.value = formatarTelefone(campo.telResidencial.value); });
  campo.cep.addEventListener('input', () => { campo.cep.value = formatarCep(campo.cep.value); });

  fotoInput.addEventListener('change', () => {
    const arquivo = fotoInput.files && fotoInput.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e) => {
      fotoAtualDataUrl = e.target.result;
      fotoPreview.src = fotoAtualDataUrl;
    };
    leitor.readAsDataURL(arquivo);
  });

  /* ---------------------------------------------------------
     6. CONTROLLER — validação e submissão do formulário
     --------------------------------------------------------- */
  function validarFormulario() {
    limparErros();
    let valido = true;

    if (!campo.tipoAluno.value) { mostrarErro('tipoAluno', 'Selecione o tipo de aluno.'); valido = false; }
    if (!campo.nome.value.trim()) { mostrarErro('nome', 'Informe o nome completo.'); valido = false; }

    if (!Validador.validarCPF(campo.cpf.value)) {
      mostrarErro('cpf', 'CPF inválido.'); valido = false;
    } else {
      const cpfDigitos = Validador.somenteDigitos(campo.cpf.value);
      const idAtual = campo.id.value ? Number(campo.id.value) : null;
      const duplicado = alunos.some(a => a.cpf === cpfDigitos && a.id !== idAtual);
      if (duplicado) { mostrarErro('cpf', 'Já existe um aluno cadastrado com esse CPF.'); valido = false; }
    }

    if (!Validador.validarEmail(campo.email.value)) { mostrarErro('email', 'E-mail inválido.'); valido = false; }
    if (!Validador.validarTelefone(campo.telCelular.value, true)) { mostrarErro('telCelular', 'Informe um telefone celular válido.'); valido = false; }
    if (!campo.endereco.value.trim()) { mostrarErro('endereco', 'Informe o endereço.'); valido = false; }
    if (!Validador.validarCep(campo.cep.value)) { mostrarErro('cep', 'CEP inválido.'); valido = false; }
    if (!campo.uf.value) { mostrarErro('uf', 'Selecione a UF.'); valido = false; }
    if (!campo.nivelIngles.value) { mostrarErro('nivelIngles', 'Selecione o nível de inglês.'); valido = false; }

    const editando = Boolean(campo.id.value);
    if (!editando) {
      if (campo.senha.value.length < 4) { mostrarErro('senha', 'A senha deve ter ao menos 4 caracteres.'); valido = false; }
      if (campo.senha.value !== campo.confirmarSenha.value) { mostrarErro('confirmarSenha', 'As senhas não coincidem.'); valido = false; }
    }

    return valido;
  }

  function limparFormulario() {
    form.reset();
    campo.id.value = '';
    limparErros();
    fotoAtualDataUrl = null;
    fotoPreview.src = 'img/menina.png';
    document.getElementById('btnSalvar').textContent = 'Cadastrar aluno';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      mostrarToast('Corrija os campos destacados antes de salvar.', true);
      return;
    }

    const editando = Boolean(campo.id.value);
    const dados = {
      tipoAluno: campo.tipoAluno.value,
      cpf: Validador.somenteDigitos(campo.cpf.value),
      nome: campo.nome.value.trim(),
      endereco: campo.endereco.value.trim(),
      cep: Validador.somenteDigitos(campo.cep.value),
      uf: campo.uf.value,
      telResidencial: Validador.somenteDigitos(campo.telResidencial.value),
      telCelular: Validador.somenteDigitos(campo.telCelular.value),
      email: campo.email.value.trim(),
      nivelIngles: campo.nivelIngles.value,
      foto: fotoAtualDataUrl || 'img/menina.png'
    };

    if (editando) {
      const id = Number(campo.id.value);
      const existente = alunos.find(a => a.id === id);
      dados.foto = fotoAtualDataUrl || (existente ? existente.foto : 'img/menina.png');
      alunos = alunos.map(a => a.id === id ? { ...a, ...dados } : a);
      mostrarToast('Dados atualizados com sucesso!');
    } else {
      alunos.push({ id: proximoId++, ...dados });
      mostrarToast(`Aluno "${dados.nome}" cadastrado com sucesso na enJoy!`);
    }

    limparFormulario();
    renderTudo();
    document.getElementById('consulta').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);

  /* ---------------------------------------------------------
     7. CONTROLLER — busca, filtros, editar/excluir
     --------------------------------------------------------- */
  searchInput.addEventListener('input', () => {
    termoBusca = searchInput.value;
    renderGrid();
  });

  filterButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filtroAtual = btn.dataset.filter;
    filterButtons.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderGrid();
  });

  studentsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const acao = btn.dataset.action;

    if (acao === 'editar') {
      const a = alunos.find(x => x.id === id);
      if (!a) return;
      campo.id.value = a.id;
      campo.tipoAluno.value = a.tipoAluno;
      campo.nome.value = a.nome;
      campo.cpf.value = formatarCPF(a.cpf);
      campo.email.value = a.email;
      campo.telCelular.value = formatarTelefone(a.telCelular);
      campo.telResidencial.value = formatarTelefone(a.telResidencial);
      campo.endereco.value = a.endereco;
      campo.cep.value = formatarCep(a.cep);
      campo.uf.value = a.uf;
      campo.nivelIngles.value = a.nivelIngles;
      campo.senha.value = '';
      campo.confirmarSenha.value = '';
      fotoAtualDataUrl = null;
      fotoPreview.src = a.foto || 'img/menina.png';
      limparErros();
      document.getElementById('btnSalvar').textContent = 'Salvar alterações';
      document.getElementById('cadastro').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (acao === 'excluir') {
      const a = alunos.find(x => x.id === id);
      if (!a) return;
      idParaExcluir = id;
      modalText.textContent = `Tem certeza que deseja excluir "${a.nome}"? Esta ação não pode ser desfeita.`;
      modal.hidden = false;
    }
  });

  modalCancel.addEventListener('click', () => { modal.hidden = true; idParaExcluir = null; });
  modal.addEventListener('click', (e) => { if (e.target === modal) { modal.hidden = true; idParaExcluir = null; } });

  modalConfirm.addEventListener('click', () => {
    if (idParaExcluir == null) return;
    const alvo = alunos.find(a => a.id === idParaExcluir);
    alunos = alunos.filter(a => a.id !== idParaExcluir);
    modal.hidden = true;
    mostrarToast(`Aluno "${alvo ? alvo.nome : ''}" excluído com sucesso.`);
    idParaExcluir = null;
    renderTudo();
  });

  /* ---------------------------------------------------------
     8. Menu mobile
     --------------------------------------------------------- */
  navToggle.addEventListener('click', () => {
    const aberto = headerNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(aberto));
  });
  headerNav.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => {
      headerNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------
     9. Inicialização
     --------------------------------------------------------- */
  renderTudo();
})();
