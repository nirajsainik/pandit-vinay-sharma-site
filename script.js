/* Progressive enhancement: everything is visible without JS; motion is skipped for reduced-motion users. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
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

    if (reduce || !('IntersectionObserver' in window)) return;

    // Scroll reveal with automatic stagger inside grids
    document.querySelectorAll('.grid, .awards, .facts').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.classList.add('reveal');
        c.style.setProperty('--d', Math.min(i, 8) * 80 + 'ms');
      });
    });
    document.querySelectorAll('section h2, section .sub, .about > *, .report, .note, .band .wrap > *, .prose .svc')
      .forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        if (e.target.classList.contains('facts')) countUp(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    function countUp(scope) {
      scope.querySelectorAll('b[data-count]').forEach(function (b) {
        var end = parseInt(b.dataset.count, 10), suffix = b.dataset.suffix || '', t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), eased = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(end * eased) + suffix;
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
