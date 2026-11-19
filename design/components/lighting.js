/* Javelina Works lighting engine: lamps, tubes and status lights that light the walls, pools, shadows and rivets around them.
   Framework-free. Mount once per page: JavelinaWorks.Lighting.mount(). It finds its pieces by data attributes and keeps watching for new ones.

   Markup it reads
   - Walls:    <section class="jw-wall" data-jw-wall="flake|corrugated|smooth" data-jw-seed="3"> … </section>
   - Lights:   data-jw-light="lamp|tube|status|pilot" on the glowing element (a tube's light comes from its lit fill)
               data-jw-flicker on a lamp: it flickers on the first time it comes into view
               data-jw-blink on a status light: a slow blink
   - Pools:    data-jw-pool="band|ground" on a section without a wall: a warm pool follows the lamp across it
   - Shadows:  <div class="jw-lit" data-jw-shadow><span class="jw-cast"></span><span class="jw-cast"></span> card </div>
   - Rivets:   <span class="jw-rivet"><i></i><i></i><i></i></span>
   - Flicker:  data-jw-flicker on any element (a primary Button): it gets is-flickering once, the first time it comes into view
   - Reveal:   data-jw-reveal on a Meter or LightTube block: if it is below the fold when the page loads it waits in is-pending
               (empty) and fills on first view; if it is already in view it is simply shown full

   Server-render walls with jw-wall--static: they show their static drawing until their first WebGL frame (and keep it without
   WebGL or JS).

   Cost: each wall's relief is drawn once per size; after that a wall is lit again only when the light falling on it changes, and
   frames only run while something changes (scroll, resize, hover, a flicker, a blink fade, a tube filling, the day/night switch).
   A status light blinks only while it is near the screen, and its fades run at about 30 frames a second. Pools, shadows and
   glints only move by transform and fade by opacity. Reduced motion: no flicker or blink, lights simply on, nothing waits to
   fill. No WebGL: walls keep the static drawing. */

const NOISE = [
  'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
  /* 2D simplex noise: Ian McEwan, Ashima Arts (MIT licence) */
  'float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}',
  'float fbm(vec2 p,int oct){float s=0.0,a=0.5;for(int i=0;i<5;i++){if(i>=oct)break;s+=a*snoise(p);p*=2.0;a*=0.5;}return s;}',
].join('\n');
const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
const FS_HEIGHT = 'precision highp float;uniform vec2 uRes;uniform float uDpr;uniform vec2 uSeed;uniform float uStyle;' + NOISE + '\n' +
  'void main(){vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;vec2 p=css+uSeed;float h;float c;' +
  'if(uStyle<0.5){float N=0.5+0.5*fbm(p*vec2(0.016,0.05),5);float M=smoothstep(0.25,0.75,0.5+0.5*fbm(p*0.05+17.0,3));float G=0.5+0.5*fbm(p*0.7+41.0,2);' +
  'h=clamp(0.74*N+0.2*M+0.3*G-0.16,0.0,1.0);c=clamp(0.74*(0.5+0.5*fbm(p*vec2(0.016,0.05)+91.0,5))+0.3*(0.5+0.5*fbm(p*0.7+57.0,2))-0.13,0.0,1.0);}' +
  'else{float N=0.5+0.5*fbm(p*vec2(0.012,0.035),4);float F=smoothstep(0.46,0.6,0.5+0.5*fbm(p*0.085+23.0,3));float G=0.5+0.5*fbm(p*0.55+41.0,2);' +
  'h=clamp(0.62*N+0.34*F+0.16*G-0.08,0.0,1.0);c=h;if(uStyle>1.5){float V=0.5+0.5*fbm(p*vec2(0.03,0.007)+5.0,4);float F2=smoothstep(0.48,0.62,0.5+0.5*fbm(p*0.11+29.0,3));' +
  'h=clamp(0.5*V+0.3*F2+0.18*G-0.02,0.0,1.0);c=clamp(0.55*(0.5+0.5*fbm(p*vec2(0.035,0.005)+71.0,4))+0.32*F2+0.18*G-0.02,0.0,1.0);}}' +
  'float hi=floor(h*255.0)/255.0;float lo=fract(h*255.0);gl_FragColor=vec4(hi,lo,c,1.0);}';
const FS_LIGHT = 'precision highp float;uniform sampler2D uH;uniform vec2 uRes;uniform float uDpr;uniform vec3 uLp[6];uniform vec3 uLc[6];uniform float uLr[6];' +
  'uniform float uStyle;uniform float uPeriod;uniform float uAmp;uniform float uDay;uniform vec3 uSun;uniform vec3 uSunC;' +
  'float H(vec2 uv){vec4 t=texture2D(uH,uv);return t.r+t.g/255.0;}' +
  'vec3 ramp2(float t){vec3 c0=vec3(.13,.055,.03),c1=vec3(.24,.09,.04),c2=vec3(.38,.15,.055),c3=vec3(.56,.26,.085),c4=vec3(.74,.41,.15),c5=vec3(.85,.54,.24),c6=vec3(.9,.62,.3);float s=clamp(t,0.0,1.0)*6.0;' +
  'if(s<1.0)return mix(c0,c1,s);if(s<2.0)return mix(c1,c2,s-1.0);if(s<3.0)return mix(c2,c3,s-2.0);if(s<4.0)return mix(c3,c4,s-3.0);if(s<5.0)return mix(c4,c5,s-4.0);return mix(c5,c6,s-5.0);}' +
  'vec3 ramp(float t){vec3 c0=vec3(.14,.06,.035),c1=vec3(.27,.10,.045),c2=vec3(.42,.17,.06),c3=vec3(.60,.29,.09),c4=vec3(.76,.44,.16),c5=vec3(.86,.56,.26);float s=clamp(t,0.0,1.0)*5.0;' +
  'if(s<1.0)return mix(c0,c1,s);if(s<2.0)return mix(c1,c2,s-1.0);if(s<3.0)return mix(c2,c3,s-2.0);if(s<4.0)return mix(c3,c4,s-3.0);return mix(c4,c5,s-4.0);}' +
  'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 px=1.0/uRes;' +
  'float hL=H(uv-vec2(px.x,0.0)),hR=H(uv+vec2(px.x,0.0)),hD=H(uv-vec2(0.0,px.y)),hU=H(uv+vec2(0.0,px.y));float S=uStyle<0.5?5.5:(uStyle<1.5?6.0:3.2);' +
  'float dx=(hR-hL)*uDpr*0.5;float dy=(hU-hD)*uDpr*0.5;vec3 n=normalize(vec3(-S*dx,S*dy,1.0));' +
  'vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;float h=H(uv);float zc=0.0;float ph=0.0;' +
  'if(uStyle>1.5){float k=6.2831853/uPeriod;ph=k*css.x;float sl=uAmp*k*cos(ph);zc=uAmp*(0.5+0.5*sin(ph));n=normalize(vec3(-S*dx-sl,S*dy,1.0));}' +
  'vec3 P=vec3(css,h*S+zc);float cc=texture2D(uH,uv).b;vec3 alb=uStyle<0.5?ramp(cc):ramp2(cc);if(uStyle>1.5)alb*=0.92+0.1*sin(ph);' +
  'vec3 amb=uStyle<0.5?vec3(0.22,0.22,0.30):vec3(0.2,0.2,0.27);if(uStyle>1.5)amb*=0.75+0.45*max(dot(n,normalize(vec3(-0.35,-0.45,0.82))),0.0);' +
  'float ex=uStyle>1.5?30.0:22.0;float ks=uStyle<0.5?0.0:(uStyle<1.5?0.3:0.42);vec3 acc=vec3(0.0);' +
  'for(int i=0;i<6;i++){vec3 Lv=uLp[i]-P;float d=length(Lv.xy);vec3 L=normalize(Lv);float diff=max(dot(n,L),0.0);float q=d/uLr[i];float att=exp(-1.2*q*q);' +
  'float sp=ks*pow(max(dot(n,normalize(L+vec3(0.0,0.0,1.0))),0.0),ex);acc+=(alb*diff*2.375+vec3(1.0,0.85,0.66)*sp)*uLc[i]*att;}' +
  'float sd=max(dot(n,uSun),0.0);float ss=ks*0.8*pow(max(dot(n,normalize(uSun+vec3(0.0,0.0,1.0))),0.0),ex);' +
  'vec3 day=alb*(vec3(0.42,0.42,0.46)+uSunC*sd*1.05)+uSunC*ss;vec3 night=alb*amb+vec3(0.0,0.0,0.01);' +
  'gl_FragColor=vec4(mix(night,day,uDay)+acc,1.0);}';

const STYLE = { smooth: 0, flake: 1, corrugated: 2 };
const SUN = (() => { const x = -0.5, y = -0.55, z = 0.67, l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; })();
const FLICKER = [[0, 0], [0.035, 0.7], [0.055, 0.08], [0.085, 0.9], [0.11, 0.2], [0.135, 0.62], [0.155, 0.3], [0.19, 1], [1, 1]];
const mix = (a, b, t) => a + (b - a) * t;
const ease = (x) => x * x * (3 - 2 * x);
const flickAt = (t) => { for (let i = 1; i < FLICKER.length; i++) { if (t <= FLICKER[i][0]) { const a = FLICKER[i - 1], b = FLICKER[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } } return 1; };

function prog(gl, vs, fs) {
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

class Wall {
  constructor(el) {
    this.el = el;
    this.canvas = el.querySelector(':scope > canvas.jw-wall__canvas');
    if (!this.canvas) { this.canvas = document.createElement('canvas'); this.canvas.className = 'jw-wall__canvas'; this.canvas.setAttribute('aria-hidden', 'true'); el.insertBefore(this.canvas, el.firstChild); }
    this.style = STYLE[el.getAttribute('data-jw-wall')] ?? 1;
    this.seed = (+(el.getAttribute('data-jw-seed') || 3)) * 173.0;
    const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('no webgl');
    const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!hp || hp.precision < 16) throw new Error('no highp');
    this.gl = gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.pH = prog(gl, VS, FS_HEIGHT); this.pL = prog(gl, VS, FS_LIGHT);
    this.tex = gl.createTexture(); this.fb = gl.createFramebuffer();
    this.lp = new Float32Array(18); this.lc = new Float32Array(18); this.lr = new Float32Array(6);
    this.u = {}; ['uH', 'uRes', 'uDpr', 'uLp[0]', 'uLc[0]', 'uLr[0]', 'uStyle', 'uPeriod', 'uAmp', 'uDay', 'uSun', 'uSunC'].forEach((n) => { this.u[n] = gl.getUniformLocation(this.pL, n); });
    this.key = '';
    // a lost context leaves a black canvas: fall back to the static drawing instead
    this.canvas.addEventListener('webglcontextlost', () => {
      if (this.disposed || !S) return;
      el.classList.add('jw-wall--static'); this.canvas.hidden = true; S.walls.set(el, null);
    });
  }
  resize() {
    const gl = this.gl, c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = c.width = w; this.h = c.height = h; this.dpr = dpr; this.key = '';
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    gl.viewport(0, 0, w, h); gl.useProgram(this.pH);
    gl.uniform2f(gl.getUniformLocation(this.pH, 'uRes'), w, h); gl.uniform1f(gl.getUniformLocation(this.pH, 'uDpr'), dpr);
    gl.uniform2f(gl.getUniformLocation(this.pH, 'uSeed'), this.seed, this.seed * 0.37); gl.uniform1f(gl.getUniformLocation(this.pH, 'uStyle'), this.style);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  draw(lights, rect, day, sunC, params) {
    const gl = this.gl, u = this.u; gl.viewport(0, 0, this.w, this.h); gl.useProgram(this.pL);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(u.uH, 0);
    gl.uniform2f(u.uRes, this.w, this.h); gl.uniform1f(u.uDpr, this.dpr);
    for (let i = 0; i < 6; i++) {
      const l = lights[i];
      this.lp[i * 3] = l ? l.x - rect.left : 0; this.lp[i * 3 + 1] = l ? l.y - rect.top : 0; this.lp[i * 3 + 2] = l ? l.z : 1;
      this.lc[i * 3] = l ? l.c[0] : 0; this.lc[i * 3 + 1] = l ? l.c[1] : 0; this.lc[i * 3 + 2] = l ? l.c[2] : 0; this.lr[i] = l ? l.r : 1;
    }
    gl.uniform3fv(u['uLp[0]'], this.lp); gl.uniform3fv(u['uLc[0]'], this.lc); gl.uniform1fv(u['uLr[0]'], this.lr);
    gl.uniform1f(u.uStyle, this.style); gl.uniform1f(u.uPeriod, params.corrugation); gl.uniform1f(u.uAmp, 13.0);
    gl.uniform1f(u.uDay, day); gl.uniform3f(u.uSun, SUN[0], SUN[1], SUN[2]); gl.uniform3f(u.uSunC, sunC[0], sunC[1], sunC[2]);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  dispose() { this.disposed = true; const ext = this.gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
}

function hexToRgb(v, fallback) {
  const m = /#([0-9a-f]{6})/i.exec(v || '');
  if (!m) return fallback;
  const n = parseInt(m[1], 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let S = null; // engine state while mounted

function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const num = (n, d) => { const v = parseFloat(cs.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
  const ms = (n, d) => { const s = cs.getPropertyValue(n).trim(), v = parseFloat(s); return Number.isFinite(v) && v > 0 ? (/ms$/.test(s) ? v : v * 1000) : d; };
  S.colors = {
    lamp: hexToRgb(cs.getPropertyValue('--light-lamp'), [1, 0.639, 0.353]),
    tube: hexToRgb(cs.getPropertyValue('--light-tube'), [1, 0.455, 0.16]),
    ok: hexToRgb(cs.getPropertyValue('--light-ok'), [0.16, 1, 0.42]),
    sun: hexToRgb(cs.getPropertyValue('--light-sun'), [1, 0.95, 0.86]),
  };
  S.params = {
    lampReach: num('--lamp-reach', 300), lampHeight: num('--lamp-height', 56), tubeReach: num('--tube-reach', 150), tubeHeight: num('--tube-height', 18),
    statusReach: num('--status-reach', 130), statusHeight: num('--status-height', 8), corrugation: num('--corrugation', 96),
    flicker: ms('--duration-flicker', 2800),
  };
  S.dayTarget = document.documentElement.getAttribute('data-theme') === 'dark' ? 0 : 1;
}

function scan() {
  const root = S.root;
  const q = (sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
  // walls
  const wallEls = q('[data-jw-wall]');
  S.walls.forEach((w, el) => { if (!wallEls.includes(el) || !el.isConnected) { w && w.dispose(); S.walls.delete(el); S.io.unobserve(el); } });
  wallEls.forEach((el) => {
    if (S.walls.has(el)) return;
    let w = null;
    // the wall keeps jw-wall--static (and its canvas stays hidden) until its first frame is drawn, so it never shows black
    try { w = new Wall(el); } catch (e) { el.classList.add('jw-wall--static'); const c = el.querySelector(':scope > canvas.jw-wall__canvas'); if (c) c.hidden = true; }
    S.walls.set(el, w); S.io.observe(el); if (w) { w.resize(); if (S.ro) S.ro.observe(w.canvas); }
  });
  const stateOf = (el) => { let st = S.lightState.get(el); if (!st) { st = { flickerStart: null, blinkT0: performance.now() }; S.lightState.set(el, st); } return st; };
  // flicker once on first view: the lamp (its light level follows the flicker) or any primary Button with data-jw-flicker
  q('[data-jw-flicker]').forEach((el) => {
    const st = stateOf(el); if (st.watched) return; st.watched = true;
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting && st.flickerStart === null) {
      st.flickerStart = S.reduce ? -1e9 : performance.now(); io.disconnect(); S.flickerIOs.delete(io);
      if (!S.reduce) { el.classList.add('is-flickering'); el.addEventListener('animationend', () => el.classList.remove('is-flickering'), { once: true }); }
      request(); } }); }, { threshold: 0.6 });
    io.observe(el); S.flickerIOs.add(io);
  });
  // lights
  S.lights = q('[data-jw-light]').map((el) => {
    const st = stateOf(el);
    st.reveal = el.closest('[data-jw-reveal]');
    // a blinking light only blinks while it is near the screen (S.visible), so it never keeps frames running off-screen
    if (el.hasAttribute('data-jw-blink') && !S.blinkEls.has(el)) { S.blinkEls.add(el); S.io.observe(el); }
    return el;
  });
  S.blinkEls.forEach((el) => { if (!el.isConnected || !el.hasAttribute('data-jw-blink')) { S.blinkEls.delete(el); S.io.unobserve(el); S.visible.delete(el); } });
  // reveals (Meter, LightTube): below the fold at load → is-pending until 60% in view; in view at load → left full, no jump
  q('[data-jw-reveal]').forEach((el) => {
    if (S.reveals.has(el)) return; S.reveals.add(el);
    if (S.reduce) return;
    const r = el.getBoundingClientRect();
    if (r.width && r.bottom > 0 && r.top < innerHeight) return;
    el.classList.add('is-pending'); S.revealIO.observe(el);
  });
  S.reveals.forEach((el) => { if (!el.isConnected) { S.reveals.delete(el); S.revealIO.unobserve(el); } });
  // pools
  q('[data-jw-pool]').forEach((sec) => {
    if (S.pools.has(sec)) return;
    const kinds = sec.getAttribute('data-jw-pool') === 'band' ? ['screen', 'dodge'] : ['screen'];
    const els = kinds.map((k) => { const p = document.createElement('span'); p.className = 'jw-pool jw-pool--' + k + (sec.getAttribute('data-jw-pool') === 'ground' ? ' jw-pool--ground' : ''); p.setAttribute('aria-hidden', 'true'); sec.insertBefore(p, sec.firstChild); return p; });
    S.pools.set(sec, els); S.io.observe(sec);
  });
  // shadows + rivets
  q('[data-jw-shadow]').forEach((el) => { if (!S.shadows.has(el)) { S.shadows.set(el, el.querySelectorAll(':scope > .jw-cast')); S.io.observe(el); } });
  S.rivets = q('.jw-rivet').map((el) => ({ el, g: el.querySelectorAll('i') }));
  request();
}

function lightsNow(now) {
  const out = [], sources = [];
  const day = S.day, P = S.params, C = S.colors;
  S.lights.forEach((el) => {
    const kind = el.getAttribute('data-jw-light'), st = S.lightState.get(el);
    if (st.reveal && st.reveal.classList.contains('is-pending')) return; // a tube or pilot still waiting to fill gives no light
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    if (kind === 'lamp') {
      let lvl = 1;
      if (el.hasAttribute('data-jw-flicker')) {
        if (st.flickerStart === null) lvl = 0;
        else { const t = (now - st.flickerStart) / P.flicker; lvl = t >= 1 ? 1 : flickAt(Math.max(0, t)); if (t < 1) S.busy = true; }
      }
      st.boost = st.boost || 0; let fv = false; try { fv = el.matches(':focus-visible'); } catch (e) { fv = el.matches(':focus'); }
      const target = (el.matches(':hover') || fv) ? 1 : 0;
      st.boost += (target - st.boost) * 0.14; if (Math.abs(target - st.boost) < 0.003) st.boost = target; else S.busy = true;
      const i = mix(lvl * (1 + 0.22 * st.boost), 0.55 * st.boost, day);
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      out.push({ x, y, z: P.lampHeight, c: C.lamp.map((v) => v * i), r: P.lampReach });
      sources.push({ kind, x, y, z: P.lampHeight, i, reach: P.lampReach, key: true });
    } else if (kind === 'tube') {
      if (st.lastW !== r.width) { st.lastW = r.width; S.busy = true; }
      const tl = Math.min(1, r.width / 40) * mix(1, 0.4, day);
      if (tl > 0.01) {
        [1 / 6, 1 / 2, 5 / 6].forEach((k) => out.push({ x: r.left + r.width * k, y: r.top + r.height / 2, z: P.tubeHeight, c: C.tube.map((v) => v * 0.55 * tl), r: P.tubeReach }));
        sources.push({ kind, x: r.left + r.width / 2, y: r.top + r.height / 2, z: P.tubeHeight, i: tl, reach: 260 });
      }
    } else {
      let v = 1;
      // the slow blink runs only while the light is near the screen; off-screen it is simply on and asks for no frames
      if (el.hasAttribute('data-jw-blink') && !S.reduce && S.visible.has(el)) {
        const t = (now - st.blinkT0) % 3000;
        if (t < 250) { v = ease(t / 250); S.blinking = true; } else if (t < 950) { v = 1; S.wakeIn = Math.min(S.wakeIn, 950 - t); }
        else if (t < 1400) { v = 1 - ease((t - 950) / 450); S.blinking = true; } else { v = 0; S.wakeIn = Math.min(S.wakeIn, 3000 - t); }
      }
      if (el.hasAttribute('data-jw-blink') && !S.reduce) { const b = v.toFixed(3); if (st.blink !== b) { st.blink = b; el.style.setProperty('--blink', b); } }
      const i = v * mix(1, 0.45, day) * (kind === 'pilot' ? 0.75 : 1);
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (i > 0.01) out.push({ x, y, z: P.statusHeight, c: C.ok.map((c) => c * 0.62 * i), r: kind === 'pilot' ? 95 : P.statusReach });
      sources.push({ kind, x, y, z: P.statusHeight, i, reach: 200 });
    }
  });
  return { list: out, sources };
}

function frame(now) {
  S.queued = false; S.busy = false; S.blinking = false; S.wakeIn = Infinity;
  S.day += (S.dayTarget - S.day) * 0.1; if (Math.abs(S.dayTarget - S.day) < 0.003) S.day = S.dayTarget; else S.busy = true;
  const day = S.day;
  const L = lightsNow(now);
  const key = L.sources.find((s) => s.key);
  // read every position first
  const walls = []; S.walls.forEach((w, el) => { if (w && S.visible.has(el)) walls.push([w, w.canvas.getBoundingClientRect()]); });
  const pools = []; S.pools.forEach((els, sec) => { if (S.visible.has(sec)) pools.push([els, sec.getBoundingClientRect()]); });
  const shadows = []; S.shadows.forEach((casts, el) => { if (S.visible.has(el)) shadows.push([el, casts, el.getBoundingClientRect()]); });
  const rivets = S.rivets.filter((v) => v.el.isConnected).map((v) => [v, v.el.getBoundingClientRect()]).filter((a) => a[1].bottom > -50 && a[1].top < innerHeight + 50);
  // then write
  walls.forEach(([w, r]) => {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // lights farther than 3x their reach from the wall add nothing visible (under 0.003%); leave them out
    const reach = (l) => Math.hypot(Math.max(r.left - l.x, 0, l.x - r.right), Math.max(r.top - l.y, 0, l.y - r.bottom)) < 3 * l.r;
    const near = L.list.filter(reach).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy)).slice(0, 6);
    // redraw only when the light on this wall changed (a blink far away, or a hover elsewhere, leaves it alone)
    const key = [r.left, r.top, r.width, r.height].map((v) => v.toFixed(1)).join(',') + '|' + day.toFixed(3) + '|' + S.colors.sun.join(',') + '|' +
      near.map((l) => [l.x, l.y, l.z, l.r].map((v) => v.toFixed(1)).join(',') + ',' + l.c.map((v) => v.toFixed(4)).join(',')).join(';');
    if (key === w.key) return;
    w.key = key; w.draw(near, r, day, S.colors.sun, S.params);
    if (w.el.classList.contains('jw-wall--static')) w.el.classList.remove('jw-wall--static');
  });
  pools.forEach(([els, r]) => {
    els.forEach((p) => {
      if (!key) { p.style.opacity = '0'; return; }
      p.style.transform = `translate3d(${(key.x - r.left - 550).toFixed(1)}px,${(key.y - r.top - 550).toFixed(1)}px,0)`;
      p.style.opacity = (Math.min(1, key.i) * mix(1, 0.35, day)).toFixed(3);
    });
  });
  const others = L.sources.filter((s) => !s.key && s.kind === 'tube');
  shadows.forEach(([el, casts, r]) => {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let w = 0, ox = 0, oy = 0, sc = 1, above = false;
    if (key) {
      const vx = cx - key.x, vy = cy - key.y, d = Math.max(1, Math.hypot(vx, vy));
      w = Math.max(0, Math.min(1, 1.35 - d / 750)) * Math.min(1, key.i);
      const len = Math.min(44, d * 0.05); ox = (vx / d) * len * w; oy = (vy / d) * len * w; sc = 1 + 0.05 * Math.min(1.5, d / 600) * w; above = cy < key.y;
    }
    const bx = mix(0, 9, day), by = mix(12, 13, day);
    if (casts[0]) { casts[0].style.transform = `translate3d(${(ox + bx * (1 - w)).toFixed(1)}px,${(oy + by * (1 - w)).toFixed(1)}px,0) scale(${sc.toFixed(3)})`; casts[0].style.opacity = (mix(0.32, 0.22, day) + 0.4 * w).toFixed(3); }
    const rim = w * (1 - day); el.style.setProperty('--rt', (above ? 0 : rim).toFixed(3)); el.style.setProperty('--rb', (above ? rim : 0).toFixed(3));
    if (casts[1]) {
      let best = null, bw = 0;
      others.forEach((s) => { const ux = cx - s.x, uy = cy - s.y, ud = Math.max(1, Math.hypot(ux, uy)); const ww = s.i * Math.max(0, Math.min(1, 1.25 - ud / 420)); if (ud > 60 && ww > bw) { bw = ww; best = [ux / ud, uy / ud, Math.min(28, ud * 0.06)]; } });
      if (best) { casts[1].style.transform = `translate3d(${(best[0] * best[2]).toFixed(1)}px,${(best[1] * best[2]).toFixed(1)}px,0)`; casts[1].style.opacity = (0.5 * bw).toFixed(3); } else casts[1].style.opacity = '0';
    }
  });
  rivets.forEach(([v, r]) => {
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const tube = L.sources.find((s) => s.kind === 'tube'), ok = L.sources.find((s) => s.kind !== 'tube' && s.kind !== 'lamp');
    [key, tube, ok].forEach((s, i) => {
      const g = v.g[i]; if (!g) return;
      if (i === 0 && day > 0.5) { const sz = SUN[2] + 1, sl = Math.hypot(SUN[0], SUN[1], sz); g.style.transform = `translate3d(${(SUN[0] / sl * 3.2).toFixed(2)}px,${(SUN[1] / sl * 3.2).toFixed(2)}px,0)`; g.style.opacity = (0.9 * day).toFixed(3); return; }
      if (!s) { g.style.opacity = '0'; return; }
      const dx = s.x - x, dy = s.y - y, dl = Math.hypot(dx, dy, s.z), hx = dx / dl, hy = dy / dl, hz = s.z / dl + 1, hl = Math.hypot(hx, hy, hz);
      const q = Math.hypot(dx, dy) / (i === 0 ? 420 : s.reach), att = Math.exp(-1.2 * q * q);
      g.style.transform = `translate3d(${(hx / hl * 3.2).toFixed(2)}px,${(hy / hl * 3.2).toFixed(2)}px,0)`; g.style.opacity = Math.min(1, att * s.i * 1.5).toFixed(3);
    });
  });
  clearTimeout(S.timer);
  if (S.busy) request();
  // a blink fade on its own steps at about 30 frames a second: smooth enough for a 14px light, and well under 50 frames in 3 s
  else if (S.blinking) S.timer = setTimeout(request, 33);
  else if (S.wakeIn < Infinity) S.timer = setTimeout(request, S.wakeIn);
}

function request() { if (S && !S.queued) { S.queued = true; requestAnimationFrame(frame); } }

export function mount(root) {
  if (S) { S.count++; scan(); return api; }
  S = { count: 1, root: root || document, walls: new Map(), pools: new Map(), shadows: new Map(), lightState: new WeakMap(), lights: [], rivets: [], visible: new Set(),
    blinkEls: new Set(), reveals: new Set(), flickerIOs: new Set(),
    day: 0, dayTarget: 0, queued: false, timer: null, reduce: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) };
  S.revealIO = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('is-pending'); S.revealIO.unobserve(e.target); request(); } }); }, { threshold: 0.6 });
  readTheme(); S.day = S.dayTarget;
  S.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { S.walls.forEach((w) => w && w.resize()); request(); }) : null;
  S.io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) S.visible.add(e.target); else S.visible.delete(e.target); }); request(); }, { rootMargin: '200px 0px' });
  S.onScroll = () => request();
  S.onResize = () => { clearTimeout(S.rt); S.rt = setTimeout(() => { S.walls.forEach((w) => w && w.resize()); request(); }, 150); request(); };
  S.onPointer = () => request();
  window.addEventListener('scroll', S.onScroll, { passive: true }); window.addEventListener('resize', S.onResize);
  document.addEventListener('pointerover', S.onPointer, { passive: true }); document.addEventListener('pointerout', S.onPointer, { passive: true });
  document.addEventListener('focusin', S.onPointer); document.addEventListener('focusout', S.onPointer);
  // a tube filling (or anything else easing) wakes the loop; it then runs only while something is still moving
  document.addEventListener('transitionrun', S.onPointer, true); document.addEventListener('transitionend', S.onPointer, true);
  S.themeObs = new MutationObserver(() => { readTheme(); request(); });
  S.themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
  let pending = null;
  S.domObs = new MutationObserver(() => { clearTimeout(pending); pending = setTimeout(() => { if (S) scan(); }, 60); });
  S.domObs.observe(S.root === document ? document.body : S.root, { childList: true, subtree: true, attributes: true,
    attributeFilter: ['data-jw-light', 'data-jw-wall', 'data-jw-pool', 'data-jw-shadow', 'data-jw-flicker', 'data-jw-blink', 'data-jw-reveal'] });
  scan();
  return api;
}

export function unmount() {
  if (!S) return;
  if (--S.count > 0) return;
  window.removeEventListener('scroll', S.onScroll); window.removeEventListener('resize', S.onResize);
  document.removeEventListener('pointerover', S.onPointer); document.removeEventListener('pointerout', S.onPointer);
  document.removeEventListener('focusin', S.onPointer); document.removeEventListener('focusout', S.onPointer);
  document.removeEventListener('transitionrun', S.onPointer, true); document.removeEventListener('transitionend', S.onPointer, true);
  S.themeObs.disconnect(); S.domObs.disconnect(); S.io.disconnect(); if (S.ro) S.ro.disconnect(); clearTimeout(S.timer);
  S.revealIO.disconnect(); S.reveals.forEach((el) => el.classList.remove('is-pending')); S.flickerIOs.forEach((io) => io.disconnect());
  S.walls.forEach((w, el) => { if (w) w.dispose(); el.classList.add('jw-wall--static'); });
  S = null;
}

export function refresh() { if (S) scan(); }

const api = { mount, unmount, refresh };
export default api;
