/* Progressive enhancement: everything is visible without JS; motion is skipped for reduced-motion users. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) root.classList.add('js');

  // Landing splash: home page only, once per browser session
  var seen = false;
  try { seen = sessionStorage.getItem('splashSeen') === '1'; } catch (e) {}
  var path = location.pathname;
  var onHome = !/\/blog\//.test(path) && /(\/|index\.html)$/.test(path);
  if (!reduce && !seen && onHome) root.classList.add('splash-on');

  document.addEventListener('DOMContentLoaded', function () {
    var sp = document.getElementById('splash');
    if (sp) {
      if (!root.classList.contains('splash-on')) sp.remove();
      else {
        var done = false;
        var close = function () {
          if (done) return;
          done = true;
          sp.classList.add('out');
          root.classList.remove('splash-on');
          try { sessionStorage.setItem('splashSeen', '1'); } catch (e) {}
          setTimeout(function () { sp.remove(); }, 900);
        };
        sp.addEventListener('click', close);
        setTimeout(close, 2900);
      }
    }

    var header = document.querySelector('header');
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
        if (header) header.classList.toggle('scrolled', y > 24);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    (function initSlider() {
      var slides = document.querySelectorAll('.slide'), dots = document.querySelectorAll('.sdots button');
      if (slides.length < 2) return;
      var i = 0, timer = null, box = document.querySelector('.slider');
      function go(n) {
        slides[i].classList.remove('on'); dots[i].classList.remove('on');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('on'); dots[i].classList.add('on');
      }
      function play() { if (!reduce) { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6500); } }
      dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); play(); }); });
      document.querySelector('.sarrow.prev').addEventListener('click', function () { go(i - 1); play(); });
      document.querySelector('.sarrow.next').addEventListener('click', function () { go(i + 1); play(); });
      box.addEventListener('mouseenter', function () { clearInterval(timer); });
      box.addEventListener('mouseleave', play);
      play();
    })();

    if (reduce || !('IntersectionObserver' in window)) return;

    // Scroll reveal with automatic stagger inside grids
    document.querySelectorAll('.grid, .awards, .facts, .main-services, .ser-grid, .testi-grid, .pills').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.classList.add('reveal');
        c.style.setProperty('--d', Math.min(i, 8) * 80 + 'ms');
      });
    });
    document.querySelectorAll('section h2, section .sub, .about > *, .report, .note, .band .wrap > *, .prose .svc, .statrow')
      .forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        if (e.target.classList.contains('facts') || e.target.classList.contains('statrow')) countUp(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    function countUp(scope) {
      scope.querySelectorAll('b[data-count]').forEach(function (b) {
        var end = parseInt(b.dataset.count, 10), suffix = b.dataset.suffix || '', t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), eased = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(end * eased).toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }

    // Subtle pointer-follow glow on cards (desktop only)
    if (matchMedia('(hover:hover)').matches) {
      document.querySelectorAll('.card').forEach(function (c) {
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          c.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });
    }
  });
})();
