/* Vai de Milhas — interações (vanilla JS, sem dependências) */
(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var hero = document.querySelector('.hero');
  var whatsFloat = document.getElementById('whatsFloat');

  /* ---------- Navegação: fundo ao rolar ---------- */
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  function closeMenu() {
    nav.classList.remove('menu-open');
    document.body.classList.remove('no-scroll');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('menu-open');
    document.body.classList.toggle('no-scroll', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Botão flutuante: aparece depois do hero ---------- */
  if ('IntersectionObserver' in window && hero && whatsFloat) {
    new IntersectionObserver(function (entries) {
      whatsFloat.classList.toggle('show', !entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(hero);
  } else if (whatsFloat) {
    whatsFloat.classList.add('show');
  }

  /* ---------- Animações de entrada ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Lightbox do Diário de Bordo ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.dia-item'));
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var current = 0;

  function openLightbox(index) {
    current = index;
    var img = items[index].querySelector('img');
    var cap = items[index].querySelector('figcaption');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function step(dir) {
    openLightbox((current + dir + items.length) % items.length);
  }

  items.forEach(function (item, i) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Ampliar foto: ' + (item.querySelector('figcaption') || {}).textContent);
    item.addEventListener('click', function () { openLightbox(i); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- Formulário antes de abrir o WhatsApp ---------- */
  var waModal = document.getElementById('waModal');
  if (waModal) {
    var waForm = document.getElementById('waForm');
    var waNome = document.getElementById('waNome');
    var waSobrenome = document.getElementById('waSobrenome');
    var waTel = document.getElementById('waTel');
    var waErro = document.getElementById('waErro');
    var waFechar = document.getElementById('waFechar');
    var origem = 'https://wa.me/5551981968250';
    var focoAnterior = null;

    function guardar(chave, valor) {
      try { window.localStorage.setItem(chave, valor); } catch (e) {}
    }

    function recuperar(chave) {
      try { return window.localStorage.getItem(chave) || ''; } catch (e) { return ''; }
    }

    // Máscara de celular: (51) 98196-8250
    function mascara(v) {
      var n = v.replace(/\D/g, '').slice(0, 11);
      if (n.length <= 2) return n.length ? '(' + n : '';
      if (n.length <= 6) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
      if (n.length <= 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
      return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
    }

    waTel.addEventListener('input', function () {
      var pos = this.selectionStart === this.value.length;
      this.value = mascara(this.value);
      if (pos) this.selectionStart = this.selectionEnd = this.value.length;
    });

    function abrirModal(href) {
      origem = href || origem;
      focoAnterior = document.activeElement;
      waErro.hidden = true;
      waNome.value = recuperar('vdm_nome');
      waSobrenome.value = recuperar('vdm_sobrenome');
      waTel.value = recuperar('vdm_tel');
      waModal.hidden = false;
      document.body.classList.add('no-scroll');
      setTimeout(function () { (waNome.value ? waTel : waNome).focus(); }, 40);
    }

    function fecharModal() {
      waModal.hidden = true;
      document.body.classList.remove('no-scroll');
      if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
    }

    // Todo botão de WhatsApp passa pelo formulário (o link segue valendo sem JS)
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModal(this.getAttribute('href'));
      });
    });

    waFechar.addEventListener('click', fecharModal);

    waModal.addEventListener('click', function (e) {
      if (e.target === waModal) fecharModal();
    });

    document.addEventListener('keydown', function (e) {
      if (!waModal.hidden && e.key === 'Escape') fecharModal();
    });

    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = waNome.value.trim();
      var sobrenome = waSobrenome.value.trim();
      var tel = waTel.value.trim();
      var digitos = tel.replace(/\D/g, '');

      [waNome, waSobrenome, waTel].forEach(function (c) { c.classList.remove('erro'); });

      if (nome.length < 2) { waNome.classList.add('erro'); return falhar('Informe o seu nome.', waNome); }
      if (sobrenome.length < 2) { waSobrenome.classList.add('erro'); return falhar('Informe o seu sobrenome.', waSobrenome); }
      if (digitos.length < 10 || digitos.length > 11) { waTel.classList.add('erro'); return falhar('Informe um celular válido com DDD.', waTel); }

      waErro.hidden = true;
      guardar('vdm_nome', nome);
      guardar('vdm_sobrenome', sobrenome);
      guardar('vdm_tel', tel);

      // Reaproveita o contexto do botão que originou o clique
      var contexto = 'Vim pelo site da Vai de Milhas e quero conversar sobre uma viagem.';
      var pos = origem.indexOf('text=');
      if (pos > -1) {
        try {
          contexto = decodeURIComponent(origem.slice(pos + 5).split('&')[0].replace(/\+/g, ' '));
        } catch (err) {}
        contexto = contexto.replace(/^Ol[áa]!\s*/i, '');
      }

      var msg = 'Olá! Meu nome é ' + nome + ' ' + sobrenome + ' e meu celular é ' + tel + '. ' + contexto;
      var destino = 'https://wa.me/5551981968250?text=' + encodeURIComponent(msg);

      fecharModal();
      var aba = window.open(destino, '_blank');
      if (!aba) window.location.href = destino;
    });

    function falhar(texto, campo) {
      waErro.textContent = texto;
      waErro.hidden = false;
      campo.focus();
    }
  }

  /* ---------- Ano do rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Faixa de fotos: loop contínuo e sem emenda ---------- */
  var track = document.getElementById('stripTrack');
  if (track) {
    var originais = track.children.length;
    track.insertAdjacentHTML('beforeend', track.innerHTML);

    var medirFaixa = function () {
      var a = track.children[0];
      var b = track.children[originais];
      if (!a || !b) return;
      var shift = b.offsetLeft - a.offsetLeft;
      if (shift > 0) track.style.setProperty('--strip-shift', '-' + shift + 'px');
    };

    window.addEventListener('load', medirFaixa);
    window.addEventListener('resize', medirFaixa);
    medirFaixa();
  }

  /* ---------- Globo: rotação, rotas e avião ---------- */
  var cvs = document.getElementById('globe');
  if (cvs && cvs.getContext) {
    var ctx = cvs.getContext('2d');
    var CREAM = '253,243,234';
    var GOLD = '205,162,105';
    var TILT = 0.3;
    var ct = Math.cos(TILT);
    var st = Math.sin(TILT);

    // Sinal negativo no eixo Z: mantém o leste à direita (senão o mapa fica espelhado)
    function vetor(lat, lon) {
      var p = lat * Math.PI / 180;
      var l = lon * Math.PI / 180;
      return [Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l)];
    }

    function slerp(a, b, t) {
      var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      var o = Math.acos(d);
      var so = Math.sin(o);
      if (so < 1e-6) return a.slice();
      var s1 = Math.sin((1 - t) * o) / so;
      var s2 = Math.sin(t * o) / so;
      return [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2];
    }

    // Continentes: pontos de terra decodificados de js/terra.js
    var terra = new Float32Array(0);
    if (typeof window.VDM_TERRA === 'string') {
      var bruto = window.atob(window.VDM_TERRA);
      var n = (bruto.length / 2) | 0;
      terra = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) {
        var la = bruto.charCodeAt(i * 2) * 180 / 255 - 90;
        var lo = bruto.charCodeAt(i * 2 + 1) * 360 / 255 - 180;
        var v = vetor(la, lo);
        terra[i * 3] = v[0]; terra[i * 3 + 1] = v[1]; terra[i * 3 + 2] = v[2];
      }
    }

    // Paralelos e meridianos (grade tênue)
    var grade = [];
    [-60, -30, 0, 30, 60].forEach(function (la) {
      var linha = [];
      for (var lo = -180; lo <= 180; lo += 4) linha.push(vetor(la, lo));
      grade.push(linha);
    });
    for (var lo2 = -180; lo2 < 180; lo2 += 30) {
      var mer = [];
      for (var la2 = -88; la2 <= 88; la2 += 4) mer.push(vetor(la2, lo2));
      grade.push(mer);
    }

    // Direção da luz (alto à esquerda), para o volume da esfera
    var LX = -0.42, LY = 0.50, LZ = 0.76;

    var cidades = {
      poa: vetor(-30.03, -51.23), lis: vetor(38.72, -9.14), cdg: vetor(48.86, 2.35),
      doh: vetor(25.29, 51.53), nrt: vetor(35.68, 139.69), dxb: vetor(25.20, 55.27),
      cpt: vetor(-33.92, 18.42), mle: vetor(4.17, 73.51), jfk: vetor(40.71, -74.01),
      bkk: vetor(13.75, 100.50)
    };

    var rotas = [
      [cidades.poa, cidades.lis], [cidades.poa, cidades.cdg], [cidades.poa, cidades.doh],
      [cidades.cdg, cidades.nrt], [cidades.dxb, cidades.mle], [cidades.poa, cidades.jfk],
      [cidades.doh, cidades.bkk], [cidades.poa, cidades.cpt]
    ];

    var SEG = 120;
    var arcos = rotas.map(function (r, idx) {
      var pts = [];
      for (var s = 0; s <= SEG; s++) {
        var t = s / SEG;
        var p = slerp(r[0], r[1], t);
        var alt = 1 + 0.19 * Math.sin(Math.PI * t);
        pts.push([p[0] * alt, p[1] * alt, p[2] * alt]);
      }
      return { pts: pts, a: r[0], b: r[1], fase: idx / rotas.length * 1.45, vel: 0.052 + 0.009 * (idx % 3) };
    });

    var marcos = [];
    for (var k in cidades) { if (cidades.hasOwnProperty(k)) marcos.push(cidades[k]); }

    var L = 0, A = 0, R = 0, cx = 0, cy = 0;

    function dimensionar() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      L = cvs.clientWidth;
      A = cvs.clientHeight;
      cvs.width = Math.round(L * dpr);
      cvs.height = Math.round(A * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(L, A) * 0.41;
      cx = L / 2;
      cy = A / 2;
    }

    function projetar(v, rot) {
      var cr = Math.cos(rot), sr = Math.sin(rot);
      var x = v[0] * cr + v[2] * sr;
      var z = -v[0] * sr + v[2] * cr;
      var y2 = v[1] * ct - z * st;
      var z2 = v[1] * st + z * ct;
      return [cx + x * R, cy - y2 * R, z2, x, y2];
    }

    function desenhar(rot, tempo) {
      ctx.clearRect(0, 0, L, A);

      // Corpo da esfera, iluminado do alto à esquerda
      var grad = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.05, cx, cy, R * 1.05);
      grad.addColorStop(0, 'rgba(48,64,168,0.55)');
      grad.addColorStop(0.55, 'rgba(16,30,110,0.55)');
      grad.addColorStop(1, 'rgba(0,6,54,0.65)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(' + GOLD + ',0.34)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Grade de paralelos e meridianos (um traço por linha)
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(' + CREAM + ',0.10)';
      ctx.beginPath();
      for (var g = 0; g < grade.length; g++) {
        var linha = grade[g];
        var novo = true;
        for (var gi = 0; gi < linha.length; gi++) {
          var pg = projetar(linha[gi], rot);
          if (pg[2] > 0.015) {
            if (novo) { ctx.moveTo(pg[0], pg[1]); novo = false; }
            else ctx.lineTo(pg[0], pg[1]);
          } else novo = true;
        }
      }
      ctx.stroke();

      // Continentes — agrupados por faixa de opacidade para poupar processamento
      var FAIXAS = 6;
      var caminhos = [];
      for (var f = 0; f < FAIXAS; f++) caminhos.push([]);
      var cr2 = Math.cos(rot), sr2 = Math.sin(rot);
      for (var t = 0; t < terra.length; t += 3) {
        var vx = terra[t], vy = terra[t + 1], vz = terra[t + 2];
        var x = vx * cr2 + vz * sr2;
        var z = -vx * sr2 + vz * cr2;
        var y2 = vy * ct - z * st;
        var z2 = vy * st + z * ct;
        if (z2 <= 0) continue;
        var luz = x * LX + y2 * LY + z2 * LZ;
        if (luz < 0) luz = 0;
        var alfa = (0.20 + 0.75 * luz) * (0.42 + 0.58 * z2);
        if (alfa > 0.98) alfa = 0.98;
        var faixa = (alfa * FAIXAS) | 0;
        if (faixa > FAIXAS - 1) faixa = FAIXAS - 1;
        caminhos[faixa].push(cx + x * R, cy - y2 * R, 0.55 + 1.05 * z2);
      }
      for (var f2 = 0; f2 < FAIXAS; f2++) {
        var lista = caminhos[f2];
        if (!lista.length) continue;
        ctx.fillStyle = 'rgba(' + CREAM + ',' + ((f2 + 0.5) / FAIXAS).toFixed(3) + ')';
        ctx.beginPath();
        for (var li = 0; li < lista.length; li += 3) {
          ctx.moveTo(lista[li] + lista[li + 2], lista[li + 1]);
          ctx.arc(lista[li], lista[li + 1], lista[li + 2], 0, 6.283185307179586);
        }
        ctx.fill();
      }

      ctx.lineCap = 'round';

      // Malha fixa de rotas (um traço por rota)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + GOLD + ',0.26)';
      ctx.beginPath();
      for (var r = 0; r < arcos.length; r++) {
        var pts = arcos[r].pts;
        var iniciar2 = true;
        for (var s = 0; s <= SEG; s++) {
          var pf = projetar(pts[s], rot);
          if (pf[2] > 0.02) {
            if (iniciar2) { ctx.moveTo(pf[0], pf[1]); iniciar2 = false; }
            else ctx.lineTo(pf[0], pf[1]);
          } else iniciar2 = true;
        }
      }
      ctx.stroke();

      // Cidades
      for (var m = 0; m < marcos.length; m++) {
        var pm = projetar(marcos[m], rot);
        if (pm[2] <= 0.02) continue;
        var pulso = 0.5 + 0.5 * Math.sin(tempo * 1.5 + m);
        ctx.fillStyle = 'rgba(' + GOLD + ',' + (0.5 + 0.5 * pm[2]).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(pm[0], pm[1], 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(' + GOLD + ',' + (0.26 * pm[2] * (1 - pulso)).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pm[0], pm[1], 3 + pulso * 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Voos em curso
      for (var v = 0; v < arcos.length; v++) {
        var arco = arcos[v];
        var u = (tempo * arco.vel + arco.fase) % 1.45;
        var ini = u - 0.42;
        if (ini > 1) continue;
        var fim = Math.min(u, 1);
        ini = Math.max(ini, 0);
        if (fim <= ini) continue;

        var iA = Math.floor(ini * SEG);
        var iB = Math.min(Math.ceil(fim * SEG), SEG);
        var ultimo = null;
        var penultimo = null;
        var primeiro = null;
        var novoTraco = true;

        // O rastro inteiro em um único caminho, com degradê da cauda até a ponta
        ctx.beginPath();
        for (var q = iA; q <= iB; q++) {
          var pa = projetar(arco.pts[q], rot);
          if (pa[2] > 0.02) {
            if (!primeiro) primeiro = pa;
            if (novoTraco) { ctx.moveTo(pa[0], pa[1]); novoTraco = false; }
            else ctx.lineTo(pa[0], pa[1]);
            penultimo = ultimo;
            ultimo = pa;
          } else {
            novoTraco = true;
            ultimo = pa;
          }
        }

        if (primeiro && ultimo) {
          var deg = ctx.createLinearGradient(primeiro[0], primeiro[1], ultimo[0], ultimo[1]);
          deg.addColorStop(0, 'rgba(' + GOLD + ',0)');
          deg.addColorStop(1, 'rgba(240,205,150,0.95)');
          var degLargo = ctx.createLinearGradient(primeiro[0], primeiro[1], ultimo[0], ultimo[1]);
          degLargo.addColorStop(0, 'rgba(' + GOLD + ',0)');
          degLargo.addColorStop(1, 'rgba(' + GOLD + ',0.26)');
          ctx.strokeStyle = degLargo;
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = deg;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }

        // Avião na ponta do rastro
        if (ultimo && penultimo && ultimo[2] > 0.05 && u < 1) {
          var ang = Math.atan2(ultimo[1] - penultimo[1], ultimo[0] - penultimo[0]);
          ctx.save();
          ctx.translate(ultimo[0], ultimo[1]);
          ctx.rotate(ang);
          ctx.fillStyle = 'rgba(255,251,246,0.97)';
          ctx.beginPath();
          ctx.moveTo(7, 0);
          ctx.lineTo(-4.4, 4.2);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-4.4, -4.2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    var rot = -1.05; // começa com o Atlântico de frente (Américas, África e Europa)
    var t0 = null;
    var rodando = false;
    var visivel = true;

    function quadro(ts) {
      if (!rodando) return;
      if (t0 === null) t0 = ts;
      var tempo = (ts - t0) / 1000;
      rot += 0.0022;
      desenhar(rot, tempo);
      requestAnimationFrame(quadro);
    }

    function iniciar() {
      if (rodando || reduceMotion) return;
      rodando = true;
      t0 = null;
      requestAnimationFrame(quadro);
    }

    function parar() { rodando = false; }

    dimensionar();
    desenhar(rot, 0);

    if (!reduceMotion) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visivel = entries[0].isIntersecting;
          if (visivel && !document.hidden) iniciar(); else parar();
        }, { threshold: 0.05 }).observe(cvs);
      } else {
        iniciar();
      }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) parar(); else if (visivel) iniciar();
      });
    }

    var redimensionar;
    window.addEventListener('resize', function () {
      clearTimeout(redimensionar);
      redimensionar = setTimeout(function () {
        dimensionar();
        desenhar(rot, 0);
      }, 160);
    });
  }
})();
