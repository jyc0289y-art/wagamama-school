/* 와가마마스쿨 홈페이지 — 최소 동작 스크립트
   원칙: 자바스크립트가 없어도 모든 내용이 읽혀야 한다(진행적 향상).
   - 등장 모션은 <html class="js"> 가 붙었을 때만 CSS 가 요소를 숨긴다.
     head 의 인라인 스크립트가 IntersectionObserver 유무를 보고 그 클래스를 붙인다.
     → JS 미지원·차단 환경에서는 애초에 아무것도 숨겨지지 않는다.
   - 그럼에도 이 파일이 로드에 실패할 수 있으므로 아래 타임아웃 안전망을 함께 둔다.
     「조용히 안 보이는」 상태는 절대 만들지 않는다.
   - 탭: hidden 속성은 JS 가 관리한다. prefers-reduced-motion 존중.
*/
(function () {
  'use strict';

  var docEl = document.documentElement;

  /* ── 교과서↔진짜 회화 탭 (role=tablist / aria-selected / 화살표·Home·End 이동) ── */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  if (tabs.length) {
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute('aria-controls'));
    });

    var select = function (i, focus) {
      tabs.forEach(function (t, n) {
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
        t.tabIndex = n === i ? 0 : -1;
        if (panels[n]) panels[n].hidden = n !== i;
      });
      if (focus) tabs[i].focus();
    };

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    select(0);
  }

  /* ── 스크롤 등장 (역할 4종: rv / rv-up / rv-type / rv-zoom + 손글씨 밑줄) ── */
  var els = Array.prototype.slice.call(
    document.querySelectorAll('.rv, .rv-up, .rv-type, .rv-zoom, .hand')
  );
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });

    /* 첫 화면은 지연 없이 */
    setTimeout(function () {
      Array.prototype.forEach.call(
        document.querySelectorAll('.hero .rv, .hero .rv-up, .hero .rv-type, .hero .rv-zoom, .hero .hand'),
        function (el) { el.classList.add('in'); }
      );
    }, 60);

    /* 안전망: 관찰이 어떤 이유로든 실패해도 2.5초 뒤 화면 안 요소는 강제 노출 */
    setTimeout(function () {
      var h = window.innerHeight || docEl.clientHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) el.classList.add('in');
      });
    }, 2500);
  }

  /* ── 아직 값이 안 들어온 자리는 눌러도 아무 일 없게 (잘못된 연락 방지) ── */
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var h = a.getAttribute('href') || '';
    if (h.indexOf('{{') === -1) return;
    a.setAttribute('aria-disabled', 'true');
    a.style.opacity = '.55';
    a.style.cursor = 'not-allowed';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      alert('아직 연락처가 등록되지 않았습니다.\n(초안 상태 — 원장님 확인 후 연결됩니다)');
    });
  });
})();
