/* @ds-bundle: {"format":4,"namespace":"JavelinaWorks","components":[{"name":"Button"},{"name":"Chip"},{"name":"SurveyMap"},{"name":"Meter"},{"name":"Surface"},{"name":"NavBar"},{"name":"Field"},{"name":"ThemeToggle"},{"name":"LightScene"},{"name":"LampWall"},{"name":"LightTube"},{"name":"StatusLight"},{"name":"Rivet"}]} */
(() => {
  // design/components/lighting.js
  var NOISE = [
    "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}",
    /* 2D simplex noise: Ian McEwan, Ashima Arts (MIT licence) */
    "float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}",
    "float fbm(vec2 p,int oct){float s=0.0,a=0.5;for(int i=0;i<5;i++){if(i>=oct)break;s+=a*snoise(p);p*=2.0;a*=0.5;}return s;}"
  ].join("\n");
  var VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
  var FS_HEIGHT = "precision highp float;uniform vec2 uRes;uniform float uDpr;uniform vec2 uSeed;uniform float uStyle;" + NOISE + "\nvoid main(){vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;vec2 p=css+uSeed;float h;float c;if(uStyle<0.5){float N=0.5+0.5*fbm(p*vec2(0.016,0.05),5);float M=smoothstep(0.25,0.75,0.5+0.5*fbm(p*0.05+17.0,3));float G=0.5+0.5*fbm(p*0.7+41.0,2);h=clamp(0.74*N+0.2*M+0.3*G-0.16,0.0,1.0);c=clamp(0.74*(0.5+0.5*fbm(p*vec2(0.016,0.05)+91.0,5))+0.3*(0.5+0.5*fbm(p*0.7+57.0,2))-0.13,0.0,1.0);}else{float N=0.5+0.5*fbm(p*vec2(0.012,0.035),4);float F=smoothstep(0.46,0.6,0.5+0.5*fbm(p*0.085+23.0,3));float G=0.5+0.5*fbm(p*0.55+41.0,2);h=clamp(0.62*N+0.34*F+0.16*G-0.08,0.0,1.0);c=h;if(uStyle>1.5){float V=0.5+0.5*fbm(p*vec2(0.03,0.007)+5.0,4);float F2=smoothstep(0.48,0.62,0.5+0.5*fbm(p*0.11+29.0,3));h=clamp(0.5*V+0.3*F2+0.18*G-0.02,0.0,1.0);c=clamp(0.55*(0.5+0.5*fbm(p*vec2(0.035,0.005)+71.0,4))+0.32*F2+0.18*G-0.02,0.0,1.0);}}float hi=floor(h*255.0)/255.0;float lo=fract(h*255.0);gl_FragColor=vec4(hi,lo,c,1.0);}";
  var FS_LIGHT = "precision highp float;uniform sampler2D uH;uniform vec2 uRes;uniform float uDpr;uniform vec3 uLp[6];uniform vec3 uLc[6];uniform float uLr[6];uniform float uStyle;uniform float uPeriod;uniform float uAmp;uniform float uDay;uniform vec3 uSun;uniform vec3 uSunC;float H(vec2 uv){vec4 t=texture2D(uH,uv);return t.r+t.g/255.0;}vec3 ramp2(float t){vec3 c0=vec3(.13,.055,.03),c1=vec3(.24,.09,.04),c2=vec3(.38,.15,.055),c3=vec3(.56,.26,.085),c4=vec3(.74,.41,.15),c5=vec3(.85,.54,.24),c6=vec3(.9,.62,.3);float s=clamp(t,0.0,1.0)*6.0;if(s<1.0)return mix(c0,c1,s);if(s<2.0)return mix(c1,c2,s-1.0);if(s<3.0)return mix(c2,c3,s-2.0);if(s<4.0)return mix(c3,c4,s-3.0);if(s<5.0)return mix(c4,c5,s-4.0);return mix(c5,c6,s-5.0);}vec3 ramp(float t){vec3 c0=vec3(.14,.06,.035),c1=vec3(.27,.10,.045),c2=vec3(.42,.17,.06),c3=vec3(.60,.29,.09),c4=vec3(.76,.44,.16),c5=vec3(.86,.56,.26);float s=clamp(t,0.0,1.0)*5.0;if(s<1.0)return mix(c0,c1,s);if(s<2.0)return mix(c1,c2,s-1.0);if(s<3.0)return mix(c2,c3,s-2.0);if(s<4.0)return mix(c3,c4,s-3.0);return mix(c4,c5,s-4.0);}void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 px=1.0/uRes;float hL=H(uv-vec2(px.x,0.0)),hR=H(uv+vec2(px.x,0.0)),hD=H(uv-vec2(0.0,px.y)),hU=H(uv+vec2(0.0,px.y));float S=uStyle<0.5?5.5:(uStyle<1.5?6.0:3.2);float dx=(hR-hL)*uDpr*0.5;float dy=(hU-hD)*uDpr*0.5;vec3 n=normalize(vec3(-S*dx,S*dy,1.0));vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;float h=H(uv);float zc=0.0;float ph=0.0;if(uStyle>1.5){float k=6.2831853/uPeriod;ph=k*css.x;float sl=uAmp*k*cos(ph);zc=uAmp*(0.5+0.5*sin(ph));n=normalize(vec3(-S*dx-sl,S*dy,1.0));}vec3 P=vec3(css,h*S+zc);float cc=texture2D(uH,uv).b;vec3 alb=uStyle<0.5?ramp(cc):ramp2(cc);if(uStyle>1.5)alb*=0.92+0.1*sin(ph);vec3 amb=uStyle<0.5?vec3(0.22,0.22,0.30):vec3(0.2,0.2,0.27);if(uStyle>1.5)amb*=0.75+0.45*max(dot(n,normalize(vec3(-0.35,-0.45,0.82))),0.0);float ex=uStyle>1.5?30.0:22.0;float ks=uStyle<0.5?0.0:(uStyle<1.5?0.3:0.42);vec3 acc=vec3(0.0);for(int i=0;i<6;i++){vec3 Lv=uLp[i]-P;float d=length(Lv.xy);vec3 L=normalize(Lv);float diff=max(dot(n,L),0.0);float q=d/uLr[i];float att=exp(-1.2*q*q);float sp=ks*pow(max(dot(n,normalize(L+vec3(0.0,0.0,1.0))),0.0),ex);acc+=(alb*diff*2.375+vec3(1.0,0.85,0.66)*sp)*uLc[i]*att;}float sd=max(dot(n,uSun),0.0);float ss=ks*0.8*pow(max(dot(n,normalize(uSun+vec3(0.0,0.0,1.0))),0.0),ex);vec3 day=alb*(vec3(0.42,0.42,0.46)+uSunC*sd*1.05)+uSunC*ss;vec3 night=alb*amb+vec3(0.0,0.0,0.01);gl_FragColor=vec4(mix(night,day,uDay)+acc,1.0);}";
  var STYLE = { smooth: 0, flake: 1, corrugated: 2 };
  var SUN = (() => {
    const x = -0.5, y = -0.55, z = 0.67, l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  })();
  var FLICKER = [[0, 0], [0.035, 0.7], [0.055, 0.08], [0.085, 0.9], [0.11, 0.2], [0.135, 0.62], [0.155, 0.3], [0.19, 1], [1, 1]];
  var mix = (a, b, t) => a + (b - a) * t;
  var ease = (x) => x * x * (3 - 2 * x);
  var anyGL = () => {
    try {
      return /[?&]jw-gl=any(&|$)/.test(location.search) || localStorage.getItem("jw-gl") === "any";
    } catch (e) {
      return false;
    }
  };
  var SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;
  var idle = (f) => window.requestIdleCallback ? window.requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 120);
  var unidle = (id) => window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id);
  var flickAt = (t) => {
    for (let i = 1; i < FLICKER.length; i++) {
      if (t <= FLICKER[i][0]) {
        const a = FLICKER[i - 1], b = FLICKER[i];
        return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]);
      }
    }
    return 1;
  };
  function prog(gl, vs, fs) {
    const sh = (t, s) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
      return o;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "a");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  var Wall = class {
    constructor(el) {
      var _a;
      this.el = el;
      this.canvas = el.querySelector(":scope > canvas.jw-wall__canvas");
      if (!this.canvas) {
        this.canvas = document.createElement("canvas");
        this.canvas.className = "jw-wall__canvas";
        this.canvas.setAttribute("aria-hidden", "true");
        el.insertBefore(this.canvas, el.firstChild);
      }
      this.style = (_a = STYLE[el.getAttribute("data-jw-wall")]) != null ? _a : 1;
      this.seed = +(el.getAttribute("data-jw-seed") || 3) * 173;
      const any = anyGL();
      const gl = this.canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: !any });
      if (!gl) throw new Error("no webgl");
      if (!any) {
        let r = String(gl.getParameter(gl.RENDERER) || "");
        if (!SOFTWARE.test(r) && /webkit webgl/i.test(r)) {
          const dbg = gl.getExtension("WEBGL_debug_renderer_info");
          if (dbg) r = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
        }
        if (SOFTWARE.test(r)) {
          const lose = gl.getExtension("WEBGL_lose_context");
          if (lose) lose.loseContext();
          throw new Error("software webgl");
        }
      }
      const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      if (!hp || hp.precision < 16) throw new Error("no highp");
      this.gl = gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      this.pH = prog(gl, VS, FS_HEIGHT);
      this.pL = prog(gl, VS, FS_LIGHT);
      this.tex = gl.createTexture();
      this.fb = gl.createFramebuffer();
      this.lp = new Float32Array(18);
      this.lc = new Float32Array(18);
      this.lr = new Float32Array(6);
      this.u = {};
      ["uH", "uRes", "uDpr", "uLp[0]", "uLc[0]", "uLr[0]", "uStyle", "uPeriod", "uAmp", "uDay", "uSun", "uSunC"].forEach((n) => {
        this.u[n] = gl.getUniformLocation(this.pL, n);
      });
      this.key = "";
      this.canvas.addEventListener("webglcontextlost", () => {
        if (this.disposed || !S) return;
        el.classList.add("jw-wall--static");
        this.canvas.hidden = true;
        S.walls.set(el, null);
      });
    }
    resize() {
      const gl = this.gl, c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
      if (w === this.w && h === this.h && dpr === this.dpr) return;
      this.w = c.width = w;
      this.h = c.height = h;
      this.dpr = dpr;
      this.key = "";
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
      gl.viewport(0, 0, w, h);
      gl.useProgram(this.pH);
      gl.uniform2f(gl.getUniformLocation(this.pH, "uRes"), w, h);
      gl.uniform1f(gl.getUniformLocation(this.pH, "uDpr"), dpr);
      gl.uniform2f(gl.getUniformLocation(this.pH, "uSeed"), this.seed, this.seed * 0.37);
      gl.uniform1f(gl.getUniformLocation(this.pH, "uStyle"), this.style);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    draw(lights, rect, day, sunC, params) {
      const gl = this.gl, u = this.u;
      gl.viewport(0, 0, this.w, this.h);
      gl.useProgram(this.pL);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.uniform1i(u.uH, 0);
      gl.uniform2f(u.uRes, this.w, this.h);
      gl.uniform1f(u.uDpr, this.dpr);
      for (let i = 0; i < 6; i++) {
        const l = lights[i];
        this.lp[i * 3] = l ? l.x - rect.left : 0;
        this.lp[i * 3 + 1] = l ? l.y - rect.top : 0;
        this.lp[i * 3 + 2] = l ? l.z : 1;
        this.lc[i * 3] = l ? l.c[0] : 0;
        this.lc[i * 3 + 1] = l ? l.c[1] : 0;
        this.lc[i * 3 + 2] = l ? l.c[2] : 0;
        this.lr[i] = l ? l.r : 1;
      }
      gl.uniform3fv(u["uLp[0]"], this.lp);
      gl.uniform3fv(u["uLc[0]"], this.lc);
      gl.uniform1fv(u["uLr[0]"], this.lr);
      gl.uniform1f(u.uStyle, this.style);
      gl.uniform1f(u.uPeriod, params.corrugation);
      gl.uniform1f(u.uAmp, 13);
      gl.uniform1f(u.uDay, day);
      gl.uniform3f(u.uSun, SUN[0], SUN[1], SUN[2]);
      gl.uniform3f(u.uSunC, sunC[0], sunC[1], sunC[2]);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    dispose() {
      this.disposed = true;
      const ext = this.gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    }
  };
  function hexToRgb(v, fallback) {
    const m = /#([0-9a-f]{6})/i.exec(v || "");
    if (!m) return fallback;
    const n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  var S = null;
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const num = (n, d) => {
      const v = parseFloat(cs.getPropertyValue(n));
      return Number.isFinite(v) ? v : d;
    };
    const ms = (n, d) => {
      const s = cs.getPropertyValue(n).trim(), v = parseFloat(s);
      return Number.isFinite(v) && v > 0 ? /ms$/.test(s) ? v : v * 1e3 : d;
    };
    S.colors = {
      lamp: hexToRgb(cs.getPropertyValue("--light-lamp"), [1, 0.639, 0.353]),
      tube: hexToRgb(cs.getPropertyValue("--light-tube"), [1, 0.455, 0.16]),
      ok: hexToRgb(cs.getPropertyValue("--light-ok"), [0.16, 1, 0.42]),
      sun: hexToRgb(cs.getPropertyValue("--light-sun"), [1, 0.95, 0.86])
    };
    S.params = {
      lampReach: num("--lamp-reach", 300),
      lampHeight: num("--lamp-height", 56),
      tubeReach: num("--tube-reach", 150),
      tubeHeight: num("--tube-height", 18),
      statusReach: num("--status-reach", 130),
      statusHeight: num("--status-height", 8),
      corrugation: num("--corrugation", 96),
      flicker: ms("--duration-flicker", 2800)
    };
    S.dayTarget = document.documentElement.getAttribute("data-theme") === "dark" ? 0 : 1;
  }
  function scan() {
    const root = S.root;
    const q = (sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
    const wallEls = q("[data-jw-wall]");
    S.walls.forEach((w, el) => {
      if (!wallEls.includes(el) || !el.isConnected) {
        w && w.dispose();
        S.walls.delete(el);
        S.pending.delete(el);
        S.io.unobserve(el);
      }
    });
    wallEls.forEach((el) => {
      if (S.walls.has(el)) return;
      el.classList.add("jw-wall--static");
      S.walls.set(el, null);
      S.io.observe(el);
      S.pending.add(el);
    });
    build();
    const stateOf = (el) => {
      let st = S.lightState.get(el);
      if (!st) {
        st = { flickerStart: null, blinkT0: performance.now() };
        S.lightState.set(el, st);
      }
      return st;
    };
    q("[data-jw-flicker]").forEach((el) => {
      const st = stateOf(el);
      if (st.watched) return;
      st.watched = true;
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting && st.flickerStart === null) {
            st.flickerStart = S.reduce ? -1e9 : performance.now();
            io.disconnect();
            S.flickerIOs.delete(io);
            if (!S.reduce) {
              el.classList.add("is-flickering");
              el.addEventListener("animationend", () => el.classList.remove("is-flickering"), { once: true });
            }
            request();
          }
        });
      }, { threshold: 0.6 });
      io.observe(el);
      S.flickerIOs.add(io);
    });
    S.lights = q("[data-jw-light]").map((el) => {
      const st = stateOf(el);
      st.reveal = el.closest("[data-jw-reveal]");
      if (el.hasAttribute("data-jw-blink") && !S.blinkEls.has(el)) {
        S.blinkEls.add(el);
        S.io.observe(el);
      }
      return el;
    });
    S.blinkEls.forEach((el) => {
      if (!el.isConnected || !el.hasAttribute("data-jw-blink")) {
        S.blinkEls.delete(el);
        S.io.unobserve(el);
        S.visible.delete(el);
      }
    });
    q("[data-jw-reveal]").forEach((el) => {
      if (S.reveals.has(el)) return;
      S.reveals.add(el);
      if (S.reduce) return;
      const r = el.getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < innerHeight) return;
      el.classList.add("is-pending");
      S.revealIO.observe(el);
    });
    S.reveals.forEach((el) => {
      if (!el.isConnected) {
        S.reveals.delete(el);
        S.revealIO.unobserve(el);
      }
    });
    q("[data-jw-pool]").forEach((sec) => {
      if (S.pools.has(sec)) return;
      const kinds = sec.getAttribute("data-jw-pool") === "band" ? ["screen", "dodge"] : ["screen"];
      const els = kinds.map((k) => {
        const p = document.createElement("span");
        p.className = "jw-pool jw-pool--" + k + (sec.getAttribute("data-jw-pool") === "ground" ? " jw-pool--ground" : "");
        p.setAttribute("aria-hidden", "true");
        sec.insertBefore(p, sec.firstChild);
        return p;
      });
      S.pools.set(sec, els);
      S.io.observe(sec);
    });
    q("[data-jw-shadow]").forEach((el) => {
      if (!S.shadows.has(el)) {
        S.shadows.set(el, el.querySelectorAll(":scope > .jw-cast"));
        S.io.observe(el);
      }
    });
    S.rivets = q(".jw-rivet").map((el) => ({ el, g: el.querySelectorAll("i") }));
    request();
  }
  function lightsNow(now) {
    const out = [], sources = [];
    const day = S.day, P = S.params, C = S.colors;
    S.lights.forEach((el) => {
      const kind = el.getAttribute("data-jw-light"), st = S.lightState.get(el);
      if (st.reveal && st.reveal.classList.contains("is-pending")) return;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (kind === "lamp") {
        let lvl = 1;
        if (el.hasAttribute("data-jw-flicker")) {
          if (st.flickerStart === null) lvl = 0;
          else {
            const t = (now - st.flickerStart) / P.flicker;
            lvl = t >= 1 ? 1 : flickAt(Math.max(0, t));
            if (t < 1) S.busy = true;
          }
        }
        st.boost = st.boost || 0;
        let fv = false;
        try {
          fv = el.matches(":focus-visible");
        } catch (e) {
          fv = el.matches(":focus");
        }
        const target = el.matches(":hover") || fv ? 1 : 0;
        st.boost += (target - st.boost) * 0.14;
        if (Math.abs(target - st.boost) < 3e-3) st.boost = target;
        else S.busy = true;
        const i = mix(lvl * (1 + 0.22 * st.boost), 0.55 * st.boost, day);
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        out.push({ x, y, z: P.lampHeight, c: C.lamp.map((v) => v * i), r: P.lampReach });
        sources.push({ kind, x, y, z: P.lampHeight, i, reach: P.lampReach, key: true });
      } else if (kind === "tube") {
        if (st.lastW !== r.width) {
          st.lastW = r.width;
          S.busy = true;
        }
        const tl = Math.min(1, r.width / 40) * mix(1, 0.4, day);
        if (tl > 0.01) {
          [1 / 6, 1 / 2, 5 / 6].forEach((k) => out.push({ x: r.left + r.width * k, y: r.top + r.height / 2, z: P.tubeHeight, c: C.tube.map((v) => v * 0.55 * tl), r: P.tubeReach }));
          sources.push({ kind, x: r.left + r.width / 2, y: r.top + r.height / 2, z: P.tubeHeight, i: tl, reach: 260 });
        }
      } else {
        let v = 1;
        if (el.hasAttribute("data-jw-blink") && !S.reduce && S.visible.has(el)) {
          const t = (now - st.blinkT0) % 3e3;
          if (t < 250) {
            v = ease(t / 250);
            S.blinking = true;
          } else if (t < 950) {
            v = 1;
            S.wakeIn = Math.min(S.wakeIn, 950 - t);
          } else if (t < 1400) {
            v = 1 - ease((t - 950) / 450);
            S.blinking = true;
          } else {
            v = 0;
            S.wakeIn = Math.min(S.wakeIn, 3e3 - t);
          }
        }
        if (el.hasAttribute("data-jw-blink") && !S.reduce) {
          const b = v.toFixed(3);
          if (st.blink !== b) {
            st.blink = b;
            el.style.setProperty("--blink", b);
          }
        }
        const i = v * mix(1, 0.45, day) * (kind === "pilot" ? 0.75 : 1);
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (i > 0.01) out.push({ x, y, z: P.statusHeight, c: C.ok.map((c) => c * 0.62 * i), r: kind === "pilot" ? 95 : P.statusReach });
        sources.push({ kind, x, y, z: P.statusHeight, i, reach: 200 });
      }
    });
    return { list: out, sources };
  }
  function frame(now) {
    S.queued = false;
    S.busy = false;
    S.blinking = false;
    S.wakeIn = Infinity;
    S.day += (S.dayTarget - S.day) * 0.1;
    if (Math.abs(S.dayTarget - S.day) < 3e-3) S.day = S.dayTarget;
    else S.busy = true;
    const day = S.day;
    const L = lightsNow(now);
    const key = L.sources.find((s) => s.key);
    const walls = [];
    S.walls.forEach((w, el) => {
      if (w && S.visible.has(el)) walls.push([w, w.canvas.getBoundingClientRect()]);
    });
    const pools = [];
    S.pools.forEach((els, sec) => {
      if (S.visible.has(sec)) pools.push([els, sec.getBoundingClientRect()]);
    });
    const shadows = [];
    S.shadows.forEach((casts, el) => {
      if (S.visible.has(el)) shadows.push([el, casts, el.getBoundingClientRect()]);
    });
    const rivets = S.rivets.filter((v) => v.el.isConnected).map((v) => [v, v.el.getBoundingClientRect()]).filter((a) => a[1].bottom > -50 && a[1].top < innerHeight + 50);
    walls.forEach(([w, r]) => {
      const cx2 = r.left + r.width / 2, cy = r.top + r.height / 2;
      const reach = (l) => Math.hypot(Math.max(r.left - l.x, 0, l.x - r.right), Math.max(r.top - l.y, 0, l.y - r.bottom)) < 3 * l.r;
      const near = L.list.filter(reach).sort((a, b) => Math.hypot(a.x - cx2, a.y - cy) - Math.hypot(b.x - cx2, b.y - cy)).slice(0, 6);
      const key2 = [r.left, r.top, r.width, r.height].map((v) => v.toFixed(1)).join(",") + "|" + day.toFixed(3) + "|" + S.colors.sun.join(",") + "|" + near.map((l) => [l.x, l.y, l.z, l.r].map((v) => v.toFixed(1)).join(",") + "," + l.c.map((v) => v.toFixed(4)).join(",")).join(";");
      if (key2 === w.key) return;
      w.key = key2;
      w.draw(near, r, day, S.colors.sun, S.params);
      if (w.el.classList.contains("jw-wall--static")) w.el.classList.remove("jw-wall--static");
    });
    pools.forEach(([els, r]) => {
      els.forEach((p) => {
        if (!key) {
          p.style.opacity = "0";
          return;
        }
        p.style.transform = `translate3d(${(key.x - r.left - 550).toFixed(1)}px,${(key.y - r.top - 550).toFixed(1)}px,0)`;
        p.style.opacity = (Math.min(1, key.i) * mix(1, 0.35, day)).toFixed(3);
      });
    });
    const others = L.sources.filter((s) => !s.key && s.kind === "tube");
    shadows.forEach(([el, casts, r]) => {
      const cx2 = r.left + r.width / 2, cy = r.top + r.height / 2;
      let w = 0, ox = 0, oy = 0, sc = 1, above = false;
      if (key) {
        const vx = cx2 - key.x, vy = cy - key.y, d = Math.max(1, Math.hypot(vx, vy));
        w = Math.max(0, Math.min(1, 1.35 - d / 750)) * Math.min(1, key.i);
        const len = Math.min(44, d * 0.05);
        ox = vx / d * len * w;
        oy = vy / d * len * w;
        sc = 1 + 0.05 * Math.min(1.5, d / 600) * w;
        above = cy < key.y;
      }
      const bx = mix(0, 9, day), by = mix(12, 13, day);
      if (casts[0]) {
        casts[0].style.transform = `translate3d(${(ox + bx * (1 - w)).toFixed(1)}px,${(oy + by * (1 - w)).toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
        casts[0].style.opacity = (mix(0.32, 0.22, day) + 0.4 * w).toFixed(3);
      }
      const rim = w * (1 - day);
      el.style.setProperty("--rt", (above ? 0 : rim).toFixed(3));
      el.style.setProperty("--rb", (above ? rim : 0).toFixed(3));
      if (casts[1]) {
        let best = null, bw = 0;
        others.forEach((s) => {
          const ux = cx2 - s.x, uy = cy - s.y, ud = Math.max(1, Math.hypot(ux, uy));
          const ww = s.i * Math.max(0, Math.min(1, 1.25 - ud / 420));
          if (ud > 60 && ww > bw) {
            bw = ww;
            best = [ux / ud, uy / ud, Math.min(28, ud * 0.06)];
          }
        });
        if (best) {
          casts[1].style.transform = `translate3d(${(best[0] * best[2]).toFixed(1)}px,${(best[1] * best[2]).toFixed(1)}px,0)`;
          casts[1].style.opacity = (0.5 * bw).toFixed(3);
        } else casts[1].style.opacity = "0";
      }
    });
    rivets.forEach(([v, r]) => {
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const tube = L.sources.find((s) => s.kind === "tube"), ok = L.sources.find((s) => s.kind !== "tube" && s.kind !== "lamp");
      [key, tube, ok].forEach((s, i) => {
        const g = v.g[i];
        if (!g) return;
        if (i === 0 && day > 0.5) {
          const sz = SUN[2] + 1, sl = Math.hypot(SUN[0], SUN[1], sz);
          g.style.transform = `translate3d(${(SUN[0] / sl * 3.2).toFixed(2)}px,${(SUN[1] / sl * 3.2).toFixed(2)}px,0)`;
          g.style.opacity = (0.9 * day).toFixed(3);
          return;
        }
        if (!s) {
          g.style.opacity = "0";
          return;
        }
        const dx = s.x - x, dy = s.y - y, dl = Math.hypot(dx, dy, s.z), hx = dx / dl, hy = dy / dl, hz = s.z / dl + 1, hl = Math.hypot(hx, hy, hz);
        const q = Math.hypot(dx, dy) / (i === 0 ? 420 : s.reach), att = Math.exp(-1.2 * q * q);
        g.style.transform = `translate3d(${(hx / hl * 3.2).toFixed(2)}px,${(hy / hl * 3.2).toFixed(2)}px,0)`;
        g.style.opacity = Math.min(1, att * s.i * 1.5).toFixed(3);
      });
    });
    clearTimeout(S.timer);
    if (S.busy) request();
    else if (S.blinking) S.timer = setTimeout(request, 33);
    else if (S.wakeIn < Infinity) S.timer = setTimeout(request, S.wakeIn);
  }
  function build() {
    const s = S;
    if (!s || s.building || !s.pending.size) return;
    if (document.readyState !== "complete") {
      if (!s.onLoad) {
        s.onLoad = () => {
          s.onLoad = null;
          build();
        };
        window.addEventListener("load", s.onLoad);
      }
      return;
    }
    s.building = true;
    s.idleId = idle(() => {
      s.building = false;
      if (S !== s) return;
      const vh = window.innerHeight;
      let el = null, best = Infinity;
      s.pending.forEach((p) => {
        if (!p.isConnected) {
          s.pending.delete(p);
          return;
        }
        const r = p.getBoundingClientRect(), d = r.bottom < 0 ? -r.bottom : r.top > vh ? r.top - vh : 0;
        if (d < best) {
          best = d;
          el = p;
        }
      });
      if (el) {
        s.pending.delete(el);
        let w = null;
        if (!s.noGL) {
          try {
            w = new Wall(el);
          } catch (e) {
            s.noGL = true;
          }
        }
        if (w) {
          s.walls.set(el, w);
          w.resize();
          if (s.ro) s.ro.observe(w.canvas);
          request();
        } else {
          const c = el.querySelector(":scope > canvas.jw-wall__canvas");
          if (c) c.hidden = true;
        }
      }
      build();
    });
  }
  function request() {
    if (S && !S.queued) {
      S.queued = true;
      requestAnimationFrame(frame);
    }
  }
  function mount(root) {
    if (S) {
      S.count++;
      scan();
      return api;
    }
    S = {
      count: 1,
      root: root || document,
      walls: /* @__PURE__ */ new Map(),
      pools: /* @__PURE__ */ new Map(),
      shadows: /* @__PURE__ */ new Map(),
      lightState: /* @__PURE__ */ new WeakMap(),
      lights: [],
      rivets: [],
      visible: /* @__PURE__ */ new Set(),
      blinkEls: /* @__PURE__ */ new Set(),
      reveals: /* @__PURE__ */ new Set(),
      flickerIOs: /* @__PURE__ */ new Set(),
      pending: /* @__PURE__ */ new Set(),
      noGL: false,
      day: 0,
      dayTarget: 0,
      queued: false,
      timer: null,
      reduce: !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    };
    S.revealIO = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove("is-pending");
          S.revealIO.unobserve(e.target);
          request();
        }
      });
    }, { threshold: 0.6 });
    readTheme();
    S.day = S.dayTarget;
    S.ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
      S.walls.forEach((w) => w && w.resize());
      request();
    }) : null;
    S.io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) S.visible.add(e.target);
        else S.visible.delete(e.target);
      });
      request();
    }, { rootMargin: "200px 0px" });
    S.onScroll = () => request();
    S.onResize = () => {
      clearTimeout(S.rt);
      S.rt = setTimeout(() => {
        S.walls.forEach((w) => w && w.resize());
        request();
      }, 150);
      request();
    };
    S.onPointer = () => request();
    window.addEventListener("scroll", S.onScroll, { passive: true });
    window.addEventListener("resize", S.onResize);
    document.addEventListener("pointerover", S.onPointer, { passive: true });
    document.addEventListener("pointerout", S.onPointer, { passive: true });
    document.addEventListener("focusin", S.onPointer);
    document.addEventListener("focusout", S.onPointer);
    document.addEventListener("transitionrun", S.onPointer, true);
    document.addEventListener("transitionend", S.onPointer, true);
    S.themeObs = new MutationObserver(() => {
      readTheme();
      request();
    });
    S.themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    let pending = null;
    S.domObs = new MutationObserver(() => {
      clearTimeout(pending);
      pending = setTimeout(() => {
        if (S) scan();
      }, 60);
    });
    S.domObs.observe(S.root === document ? document.body : S.root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-jw-light", "data-jw-wall", "data-jw-pool", "data-jw-shadow", "data-jw-flicker", "data-jw-blink", "data-jw-reveal"]
    });
    scan();
    return api;
  }
  function unmount() {
    if (!S) return;
    if (--S.count > 0) return;
    window.removeEventListener("scroll", S.onScroll);
    window.removeEventListener("resize", S.onResize);
    document.removeEventListener("pointerover", S.onPointer);
    document.removeEventListener("pointerout", S.onPointer);
    document.removeEventListener("focusin", S.onPointer);
    document.removeEventListener("focusout", S.onPointer);
    document.removeEventListener("transitionrun", S.onPointer, true);
    document.removeEventListener("transitionend", S.onPointer, true);
    S.themeObs.disconnect();
    S.domObs.disconnect();
    S.io.disconnect();
    if (S.ro) S.ro.disconnect();
    clearTimeout(S.timer);
    S.revealIO.disconnect();
    S.reveals.forEach((el) => el.classList.remove("is-pending"));
    S.flickerIOs.forEach((io) => io.disconnect());
    if (S.building) unidle(S.idleId);
    if (S.onLoad) window.removeEventListener("load", S.onLoad);
    S.walls.forEach((w, el) => {
      if (w) w.dispose();
      el.classList.add("jw-wall--static");
    });
    S = null;
  }
  function refresh() {
    if (S) scan();
  }
  var api = { mount, unmount, refresh };
  var lighting_default = api;

  // design/components/react/index.jsx
  var { useState, useEffect, useRef, useCallback } = React;
  var cx = (...a) => a.filter(Boolean).join(" ");
  var prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOGOS = {
    light: { mark: "/assets/logos/javelina-rust.svg", wordmark: "/assets/logos/wordmark-ink.svg" },
    dark: { mark: "/assets/logos/javelina-white.svg", wordmark: "/assets/logos/wordmark-white.svg" }
  };
  function useFlicker(enabled, onView) {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    useEffect(() => {
      if (!enabled || !onView || prefersReducedMotion()) return void 0;
      const el = ref.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        setActive(true);
        return void 0;
      }
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      }, { threshold: 0.6 });
      io.observe(el);
      return () => io.disconnect();
    }, [enabled, onView]);
    return [ref, active, () => setActive(false)];
  }
  function Button({ variant = "primary", size = "md", href, mark, attention = "none", lamp = false, disabled = false, className, onAnimationEnd, children, ...rest }) {
    const showMark = mark != null ? mark : variant === "primary" || variant === "burnt";
    const primary = variant === "primary" && !disabled;
    const [ref, flickering, flickerDone] = useFlicker(primary && !lamp, attention === "flicker");
    if (lamp && primary) {
      rest["data-jw-light"] = "lamp";
      rest["data-jw-flicker"] = "";
    }
    const cls = cx("jw-btn", `jw-btn--${variant}`, size === "sm" && "jw-btn--sm", flickering && "is-flickering", className);
    const endAnim = (e) => {
      if (e.animationName && e.animationName.indexOf("jw-flicker") === 0) flickerDone();
      if (onAnimationEnd) onAnimationEnd(e);
    };
    const inner = /* @__PURE__ */ React.createElement(React.Fragment, null, attention === "glint" && /* @__PURE__ */ React.createElement("span", { className: "jw-btn__glint", "aria-hidden": "true" }), showMark && /* @__PURE__ */ React.createElement("span", { className: "jw-btn__mark", "aria-hidden": "true" }), children);
    const el = href ? /* @__PURE__ */ React.createElement("a", { ref, className: cls, href: disabled ? void 0 : href, "aria-disabled": disabled || void 0, onAnimationEnd: endAnim, ...rest }, inner) : /* @__PURE__ */ React.createElement("button", { ref, type: "button", className: cls, disabled, onAnimationEnd: endAnim, ...rest }, inner);
    if (attention === "breathe") return /* @__PURE__ */ React.createElement("span", { className: "jw-attn" }, el);
    return el;
  }
  var DOT_TONES = { treat: true, success: true, warning: true, error: true };
  function Chip({ tone = "keep", dot, count, className, children, ...rest }) {
    const showDot = dot != null ? dot : !!DOT_TONES[tone];
    return /* @__PURE__ */ React.createElement("span", { className: cx("jw-chip", `jw-chip--${tone}`, className), ...rest }, showDot && /* @__PURE__ */ React.createElement("span", { className: "jw-chip__dot", "aria-hidden": "true" }), children, count != null && /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", count));
  }
  function nearestMarker(e) {
    const own = e.currentTarget;
    if (!e.detail) return own;
    let best = own, bestD = 23;
    own.parentElement.querySelectorAll(".jw-marker[data-plant]").forEach((m) => {
      const r = m.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    });
    if (best !== own && document.activeElement === own) best.focus({ preventScroll: true });
    return best;
  }
  function SurveyMap({ src, alt = "Survey image", plants: initial = [], height = 260, editable = true, showCounts = true, onChange, className, style }) {
    const [plants, setPlants] = useState(initial);
    const [selected, setSelected] = useState(null);
    const toggle = useCallback((id) => {
      setSelected(String(id));
      if (!editable) return;
      setPlants((prev) => {
        const next = prev.map((p) => String(p.id) === String(id) ? { ...p, status: p.status === "treat" ? "keep" : "treat" } : p);
        if (onChange) onChange(next);
        return next;
      });
    }, [editable, onChange]);
    const treat = plants.filter((p) => p.status === "treat").length;
    const keep = plants.length - treat;
    return /* @__PURE__ */ React.createElement("div", { className: cx("jw-photo", "jw-map", className), style: { height, ...style } }, /* @__PURE__ */ React.createElement("img", { src, alt }), plants.map((p) => {
      const isTreat = p.status === "treat";
      const label = `Plant ${p.id}: ${isTreat ? "treat" : "keep"}.${editable ? ` Press to ${isTreat ? "keep" : "treat"} it.` : ""}`;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: p.id,
          type: "button",
          className: cx("jw-marker", !isTreat && "jw-marker--keep", selected === String(p.id) && "jw-marker--selected"),
          style: { left: `${p.x}%`, top: `${p.y}%` },
          "aria-label": label,
          "aria-pressed": editable ? isTreat : void 0,
          "data-plant": p.id,
          onClick: (e) => toggle(nearestMarker(e).getAttribute("data-plant"))
        },
        /* @__PURE__ */ React.createElement("span", { className: "jw-marker__tip", "aria-hidden": "true" }, "Plant ", p.id, " \xB7 ", isTreat ? "Treat" : "Keep")
      );
    }), showCounts && /* @__PURE__ */ React.createElement("span", { className: "jw-map__counts", "aria-live": "polite" }, /* @__PURE__ */ React.createElement(Chip, { tone: "treat", count: treat }, "Treat"), /* @__PURE__ */ React.createElement(Chip, { tone: "shell", count: keep }, "Keep")));
  }
  function Meter({ value, max, label, unit = "ac", animate = true, className }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
    const fmt = (n) => Number(n).toLocaleString("en-US");
    return /* @__PURE__ */ React.createElement("div", { className: cx("jw-meter-block", className), "data-jw-reveal": animate ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "jw-meter-block__line" }, /* @__PURE__ */ React.createElement("span", null, label), /* @__PURE__ */ React.createElement("span", null, fmt(value), " of ", fmt(max), " ", unit)), /* @__PURE__ */ React.createElement("div", { className: "jw-meter", role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": value }, /* @__PURE__ */ React.createElement("div", { className: "jw-meter__fill", style: { width: `${pct}%` } })));
  }
  function Surface({ variant = "card", href, as, castShadow = false, rivets = false, className, children, ...rest }) {
    const band = variant === "band-shell" || variant === "band-agave";
    const Tag = href && !band ? "a" : as || (band ? "section" : "div");
    const el = /* @__PURE__ */ React.createElement(Tag, { className: cx("jw-surface", `jw-surface--${variant}`, href && !band && "jw-surface--link", className), href: band ? void 0 : href, ...rest }, children, rivets && !band && ["tl", "tr", "bl", "br"].map((k) => /* @__PURE__ */ React.createElement(Rivet, { key: k, className: `jw-rivet--${k}` })));
    if (castShadow && !band) return /* @__PURE__ */ React.createElement("div", { className: "jw-lit", "data-jw-shadow": "" }, /* @__PURE__ */ React.createElement("span", { className: "jw-cast", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", { className: "jw-cast", "aria-hidden": "true" }), el);
    return el;
  }
  function LightScene({ children }) {
    useEffect(() => {
      lighting_default.mount();
      return () => lighting_default.unmount();
    }, []);
    return children === void 0 ? null : children;
  }
  function LampWall({ texture = "flake", seed = 3, as = "section", className, children, ...rest }) {
    const Tag = as;
    return /* @__PURE__ */ React.createElement(Tag, { className: cx("jw-wall", `jw-wall--${texture}`, "jw-wall--static", className), "data-jw-wall": texture, "data-jw-seed": seed, ...rest }, /* @__PURE__ */ React.createElement("canvas", { className: "jw-wall__canvas", "aria-hidden": "true" }), children);
  }
  function Rivet({ className, style }) {
    return /* @__PURE__ */ React.createElement("span", { className: cx("jw-rivet", className), style, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null));
  }
  function LightTube({ value, max, label, unit = "ac", pilot = true, plate = true, animate = true, className }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
    const fmt = (n) => Number(n).toLocaleString("en-US");
    return /* @__PURE__ */ React.createElement("div", { className: cx("jw-tube-block", className), "data-jw-reveal": animate ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "jw-lit jw-tube", "data-jw-shadow": "", role: "img", "aria-label": `${label}: ${fmt(value)} of ${fmt(max)} ${unit}` }, /* @__PURE__ */ React.createElement("span", { className: "jw-cast", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", { className: "jw-cast", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("div", { className: "jw-tube__track" }, /* @__PURE__ */ React.createElement("i", { className: "jw-tube__fill", "data-jw-light": "tube", style: { width: `${pct}%` } })), /* @__PURE__ */ React.createElement("span", { className: "jw-tube__clamp jw-tube__clamp--l", "aria-hidden": "true" }, pilot ? /* @__PURE__ */ React.createElement("span", { className: "jw-pilot is-on", "data-jw-light": "pilot" }) : /* @__PURE__ */ React.createElement(Rivet, null)), /* @__PURE__ */ React.createElement("span", { className: "jw-tube__clamp jw-tube__clamp--r", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Rivet, null))), plate && /* @__PURE__ */ React.createElement(Surface, { variant: "card", castShadow: true, rivets: true, className: "jw-plate", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "jw-plate__label" }, label), /* @__PURE__ */ React.createElement("span", { className: "jw-plate__value" }, fmt(value), " ", /* @__PURE__ */ React.createElement("small", null, "of ", fmt(max), " ", unit))));
  }
  function StatusLight({ label, blink = true, className }) {
    const attrs = { "data-jw-light": "status" };
    if (blink) attrs["data-jw-blink"] = "";
    return /* @__PURE__ */ React.createElement("span", { className: cx("jw-status", className) }, /* @__PURE__ */ React.createElement("span", { className: "jw-pilot jw-pilot--status", "aria-hidden": "true", ...attrs }), /* @__PURE__ */ React.createElement("span", { className: "jw-status__label" }, label));
  }
  var navSeq = 0;
  var FOLDED = "(max-width: 900px)";
  var isFolded = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(FOLDED).matches;
  function NavBar({ links = [], moreLinks = [], action, lamp = false, sticky = false, logos = LOGOS, homeHref = "/", id, className, children }) {
    const base = useRef(id || `jw-nav-${++navSeq}`).current;
    const [open, setOpen] = useState(false);
    const [menu, setMenu] = useState(null);
    const [folded, setFolded] = useState(isFolded);
    const navRef = useRef(null), menuRef = useRef(null);
    useEffect(() => {
      const away = (e) => {
        if (navRef.current && !navRef.current.contains(e.target)) {
          setMenu(null);
          setOpen(false);
        }
      };
      document.addEventListener("click", away);
      return () => document.removeEventListener("click", away);
    }, []);
    useEffect(() => {
      if (!window.matchMedia) return void 0;
      const mq = window.matchMedia(FOLDED);
      const change = () => {
        setFolded(mq.matches);
        setOpen(false);
        setMenu(null);
      };
      mq.addEventListener("change", change);
      return () => mq.removeEventListener("change", change);
    }, []);
    useEffect(() => {
      if (menu === null && !open) return void 0;
      const onKey = (e) => {
        if (e.key !== "Escape" || e.defaultPrevented) return;
        const at = document.activeElement;
        const refocus = !at || at === document.body || navRef.current && navRef.current.contains(at);
        if (menu !== null) {
          const t = navRef.current && navRef.current.querySelector(`[aria-controls="${base}-menu-${menu}"]`);
          setMenu(null);
          if (t && refocus) t.focus();
        } else {
          setOpen(false);
          if (menuRef.current && refocus) menuRef.current.focus();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [menu, open, base]);
    const onBlur = (e) => {
      const g = e.target.closest && e.target.closest(".jw-nav__group");
      if (g && !g.contains(e.relatedTarget) && !isFolded()) setMenu(null);
    };
    const mark = (t) => ({ className: cx(`jw-logo--${t}`), src: logos[t].mark, alt: "", width: 32, height: 24, style: { height: 24, width: "auto" } });
    const word = (t) => ({ className: cx(`jw-logo--${t}`, "jw-nav__wordmark"), src: logos[t].wordmark, alt: "Javelina Works", width: 152, height: 13, style: { height: 13, width: "auto" } });
    const actionEl = action ? /* @__PURE__ */ React.createElement(Button, { key: "action", className: "jw-nav__action", size: lamp ? "md" : "sm", lamp, href: action.href }, action.label) : null;
    return /* @__PURE__ */ React.createElement("nav", { ref: navRef, className: cx("jw-nav", sticky && "jw-nav--sticky", open && "is-open", className), "aria-label": "Main", onBlur }, /* @__PURE__ */ React.createElement("a", { className: "jw-nav__brand", href: homeHref }, /* @__PURE__ */ React.createElement("img", { ...mark("light") }), /* @__PURE__ */ React.createElement("img", { ...mark("dark") }), /* @__PURE__ */ React.createElement("img", { ...word("light") }), /* @__PURE__ */ React.createElement("img", { ...word("dark") })), /* @__PURE__ */ React.createElement("button", { ref: menuRef, type: "button", className: "jw-nav__menu", "aria-expanded": open, "aria-controls": `${base}-links`, onClick: () => setOpen((o) => !o) }, open ? "Close" : "Menu"), folded && actionEl, /* @__PURE__ */ React.createElement("div", { className: "jw-nav__links", id: `${base}-links`, key: "links" }, links.map((l, i) => l.items ? /* @__PURE__ */ React.createElement("div", { className: "jw-nav__group", key: l.label }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: cx("jw-nav__link", "jw-nav__trigger", l.current && "is-current"),
        "aria-expanded": menu === i,
        "aria-controls": `${base}-menu-${i}`,
        onClick: () => setMenu((m) => m === i ? null : i)
      },
      l.label,
      /* @__PURE__ */ React.createElement("span", { className: "jw-nav__caret", "aria-hidden": "true" })
    ), /* @__PURE__ */ React.createElement("div", { className: cx("jw-navmenu", l.align === "end" && "jw-navmenu--end"), id: `${base}-menu-${i}`, hidden: menu !== i }, /* @__PURE__ */ React.createElement("ul", { className: "jw-navmenu__list" }, l.items.map((it) => /* @__PURE__ */ React.createElement("li", { key: it.href }, /* @__PURE__ */ React.createElement("a", { className: "jw-navmenu__item", href: it.href, "aria-current": it.current ? "page" : void 0 }, /* @__PURE__ */ React.createElement("span", { className: "jw-navmenu__label" }, it.label), it.description && /* @__PURE__ */ React.createElement("span", { className: "jw-navmenu__desc" }, it.description))))), l.all && /* @__PURE__ */ React.createElement("a", { className: "jw-navmenu__all", href: l.all.href, "aria-current": l.all.current ? "page" : void 0 }, l.all.label))) : /* @__PURE__ */ React.createElement("a", { key: l.href, className: "jw-nav__link", href: l.href, "aria-current": l.current ? "page" : void 0 }, l.label)), moreLinks.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "jw-nav__more" }, moreLinks.map((l) => /* @__PURE__ */ React.createElement("a", { key: l.href, className: "jw-nav__link", href: l.href, "aria-current": l.current ? "page" : void 0 }, l.label))), children), !folded && actionEl);
  }
  var fieldSeq = 0;
  function Field({ id, label, hint, error, suffix, value, defaultValue, onChange, validate, inputMode, placeholder, type = "text", className }) {
    const autoId = useRef(id || `jw-field-${++fieldSeq}`).current;
    const [inner, setInner] = useState(defaultValue != null ? defaultValue : "");
    const [msg, setMsg] = useState(null);
    const v = value !== void 0 ? value : inner;
    const shown = error || msg;
    const describedBy = [hint && `${autoId}-hint`, shown && `${autoId}-err`].filter(Boolean).join(" ") || void 0;
    return /* @__PURE__ */ React.createElement("div", { className: cx("jw-field", shown && "jw-field--error", className) }, /* @__PURE__ */ React.createElement("label", { className: "jw-field__label", htmlFor: autoId }, label), /* @__PURE__ */ React.createElement("div", { className: "jw-input-wrap" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        id: autoId,
        className: cx("jw-input", suffix && "jw-input--suffixed"),
        type,
        inputMode,
        placeholder,
        value: v,
        "aria-invalid": shown ? true : void 0,
        "aria-describedby": describedBy,
        onChange: (e) => {
          if (value === void 0) setInner(e.target.value);
          if (msg) setMsg(null);
          if (onChange) onChange(e.target.value, e);
        },
        onBlur: () => {
          if (validate) setMsg(validate(v) || null);
        }
      }
    ), suffix && /* @__PURE__ */ React.createElement("span", { className: "jw-input__suffix", "aria-hidden": "true" }, suffix)), hint && !shown && /* @__PURE__ */ React.createElement("span", { className: "jw-field__hint", id: `${autoId}-hint` }, hint), shown && /* @__PURE__ */ React.createElement("span", { className: "jw-field__error", id: `${autoId}-err` }, shown));
  }
  var THEME_KEY = "jw-theme";
  function ThemeToggle({ value, onChange, target, labels = { light: "By day", dark: "At night" }, storageKey = THEME_KEY, className }) {
    const root = () => target || (typeof document !== "undefined" ? document.documentElement : null);
    const read = () => {
      const r = root();
      return r && r.getAttribute("data-theme") === "dark" ? "dark" : "light";
    };
    const [inner, setInner] = useState(read);
    const theme = value || inner;
    const lightRef = useRef(null), darkRef = useRef(null);
    useEffect(() => {
      const r = root();
      if (!r || typeof MutationObserver === "undefined") return void 0;
      const mo = new MutationObserver(() => setInner(read()));
      mo.observe(r, { attributes: true, attributeFilter: ["data-theme"] });
      return () => mo.disconnect();
    }, [target]);
    const set = (t, focus) => {
      if (!value) setInner(t);
      const r = root();
      if (r) r.setAttribute("data-theme", t);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, t);
        } catch (e) {
        }
      }
      if (focus) {
        const b = t === "dark" ? darkRef.current : lightRef.current;
        if (b) b.focus();
      }
      if (onChange) onChange(t);
    };
    const onKeyDown = (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) < 0) return;
      e.preventDefault();
      set(theme === "dark" ? "light" : "dark", true);
    };
    return /* @__PURE__ */ React.createElement("div", { className: cx("jw-toggle", className), role: "radiogroup", "aria-label": "Color mode", onKeyDown }, ["light", "dark"].map((t) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t,
        ref: t === "dark" ? darkRef : lightRef,
        type: "button",
        role: "radio",
        "aria-checked": theme === t,
        tabIndex: theme === t ? 0 : -1,
        className: cx("jw-toggle__opt", `jw-toggle__opt--${t}`, theme === t && "is-on"),
        onClick: () => set(t)
      },
      /* @__PURE__ */ React.createElement("span", { className: "jw-toggle__lamp", "aria-hidden": "true" }),
      labels[t]
    )));
  }
  window.JavelinaWorks = { Button, Chip, SurveyMap, Meter, Surface, NavBar, Field, ThemeToggle, LightScene, LampWall, LightTube, StatusLight, Rivet, Lighting: lighting_default, LOGOS };
})();
