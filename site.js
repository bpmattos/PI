/* =========================================================
   enJoy English School — script compartilhado das páginas
   institucionais (Quem Somos, Galeria, Cursos, Planos, Login).
   Não interfere no script.js do Painel Interno (index.html).
   ========================================================= */

(function () {
  'use strict';

  /* ---- Menu mobile (mesma estrutura de header em todas as páginas) ---- */
  const navToggle = document.getElementById('navToggle');
  const headerNav = document.getElementById('headerNav');
  if (navToggle && headerNav) {
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
  }

  /* ---- FAQ accordion (página Planos) ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const pergunta = item.querySelector('.faq-question');
    if (!pergunta) return;
    pergunta.addEventListener('click', () => {
      const jaAberto = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
      if (!jaAberto) item.classList.add('is-open');
    });
  });

  /* ---- Formulário de login (Portal do Aluno) — simulação, sem back-end ---- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('loginUsuario');
      const senha = document.getElementById('loginSenha');
      const feedback = document.getElementById('loginFeedback');

      let valido = true;
      if (!usuario.value.trim()) { valido = false; }
      if (!senha.value || senha.value.length < 4) { valido = false; }

      if (!valido) {
        feedback.textContent = 'Informe usuário e senha (mínimo 4 caracteres) para continuar.';
        feedback.hidden = false;
        feedback.classList.add('is-error');
        return;
      }

      feedback.classList.remove('is-error');
      feedback.textContent = 'Login simulado com sucesso! Este portal ainda não está integrado a um back-end real.';
      feedback.hidden = false;
    });
  }

  /* ---- Botão de mostrar/ocultar senha ---- */
  const togglePwd = document.getElementById('toggleSenha');
  if (togglePwd) {
    togglePwd.addEventListener('click', () => {
      const campo = document.getElementById('loginSenha');
      const mostrando = campo.type === 'text';
      campo.type = mostrando ? 'password' : 'text';
      togglePwd.textContent = mostrando ? 'Mostrar' : 'Ocultar';
    });
  }
})();
