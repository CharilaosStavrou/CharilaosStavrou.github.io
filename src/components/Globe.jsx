import { useEffect, useRef } from 'react';
import { LAND_BITS, LAND_H, LAND_W } from '../lib/landmask.js';

// Lightweight dot-matrix globe on a 2D canvas (no WebGL / Three.js).
// - Land drawn as cyan dots, oceans as a sparse faint lattice.
// - Two thin orbit rings, one with a small satellite.
// - Pauses when the tab is hidden or the globe is off-screen.
// - With prefers-reduced-motion it renders a single static frame.

const TILT = 0.38; // radians, north pole leans toward the viewer
const SPEED = 0.0011; // radians per frame-equivalent (~60fps) -> one turn in ~95 s
const ACCENT = '92, 225, 255'; // #5CE1FF

function decodeLand() {
  const bin = atob(LAND_BITS);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return (lat, lon) => {
    const r = Math.min(LAND_H - 1, Math.max(0, Math.floor((90 - lat) / (180 / LAND_H))));
    const c = Math.min(LAND_W - 1, Math.max(0, Math.floor((lon + 180) / (360 / LAND_W))));
    const i = r * LAND_W + c;
    return (bytes[i >> 3] >> (i & 7)) & 1;
  };
}

/** Evenly spaced points on the sphere: rows of latitude, columns scaled by cos(lat). */
function lattice(stepDeg, keep) {
  const pts = [];
  for (let lat = -90 + stepDeg / 2; lat < 90; lat += stepDeg) {
    const n = Math.max(1, Math.round((360 / stepDeg) * Math.cos((lat * Math.PI) / 180)));
    for (let k = 0; k < n; k++) {
      const lon = -180 + (k + 0.5) * (360 / n);
      if (keep(lat, lon)) pts.push([(lat * Math.PI) / 180, (lon * Math.PI) / 180]);
    }
  }
  // Store as flat typed arrays: cos(lat), sin(lat), lon
  const out = new Float32Array(pts.length * 3);
  pts.forEach(([la, lo], i) => {
    out[i * 3] = Math.cos(la);
    out[i * 3 + 1] = Math.sin(la);
    out[i * 3 + 2] = lo;
  });
  return out;
}

function ringPoints(segments = 160) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([Math.cos(t), Math.sin(t)]);
  }
  return pts;
}

export default function Globe() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isLand = decodeLand();
    const land = lattice(2.4, (lat, lon) => isLand(lat, lon));
    const ocean = lattice(6, (lat, lon) => !isLand(lat, lon));
    const circle = ringPoints();
    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let size = 0, dpr = 1, raf = 0, rot = 2.2, last = 0;
    let onScreen = true;

    const resize = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = w;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Project a sphere point; returns z (depth, >0 = front) and writes screen x,y.
    const P = { x: 0, y: 0, z: 0 };
    const project = (cl, sl, lon, R, cx, cy) => {
      const a = lon + rot;
      const x = cl * Math.sin(a);
      const y = sl;
      const z = cl * Math.cos(a);
      const y2 = y * cosT - z * sinT;
      const z2 = y * sinT + z * cosT;
      P.x = cx + x * R;
      P.y = cy - y2 * R;
      P.z = z2;
    };

    // Orbit ring: circle of radius k*R, inclined by `inc`, turned by `yaw`, then tilted like the globe.
    const ringXYZ = (c, s, k, inc, yaw) => {
      let x = c * k, y = s * k * Math.sin(inc), z = s * k * Math.cos(inc);
      const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
      const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
      x = x1; z = z1;
      return [x, y * cosT - z * sinT, y * sinT + z * cosT];
    };

    const rings = [
      { k: 1.28, inc: 1.18, yaw: 0.5, alpha: 0.5 },
      { k: 1.16, inc: -0.42, yaw: -0.9, alpha: 0.28 },
    ];

    const drawRing = (ring, R, cx, cy, front) => {
      ctx.beginPath();
      let pen = false;
      for (const [c, s] of circle) {
        const [x, y, z] = ringXYZ(c, s, ring.k, ring.inc, ring.yaw);
        // Back half is hidden where it passes behind the sphere disc.
        const behind = z < 0 && x * x + y * y < 1;
        const visible = front ? z >= 0 : z < 0 && !behind;
        if (visible) {
          if (pen) ctx.lineTo(cx + x * R, cy - y * R);
          else ctx.moveTo(cx + x * R, cy - y * R);
          pen = true;
        } else pen = false;
      }
      ctx.strokeStyle = `rgba(${ACCENT}, ${front ? ring.alpha : ring.alpha * 0.45})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const draw = (t) => {
      if (!size) return;
      const cx = size / 2, cy = size / 2;
      const R = size * 0.36;
      ctx.clearRect(0, 0, size, size);

      // Soft glow behind the sphere (accent only).
      const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.45);
      g.addColorStop(0, `rgba(${ACCENT}, 0.14)`);
      g.addColorStop(1, `rgba(${ACCENT}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      rings.forEach((r) => drawRing(r, R, cx, cy, false));

      // Sphere body + rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, '#0f1d36');
      body.addColorStop(1, '#070d1a');
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ACCENT}, 0.22)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ocean lattice (front only, very faint)
      ctx.beginPath();
      const ro = Math.max(0.6, R / 260);
      for (let i = 0; i < ocean.length; i += 3) {
        project(ocean[i], ocean[i + 1], ocean[i + 2], R, cx, cy);
        if (P.z > 0) { ctx.moveTo(P.x + ro, P.y); ctx.arc(P.x, P.y, ro, 0, Math.PI * 2); }
      }
      ctx.fillStyle = `rgba(${ACCENT}, 0.13)`;
      ctx.fill();

      // Land dots, bucketed by depth so we only issue a few fills per frame.
      const buckets = [[], [], [], []];
      for (let i = 0; i < land.length; i += 3) {
        project(land[i], land[i + 1], land[i + 2], R, cx, cy);
        if (P.z > -0.05) {
          const b = P.z < 0.25 ? 0 : P.z < 0.5 ? 1 : P.z < 0.75 ? 2 : 3;
          buckets[b].push(P.x, P.y);
        }
      }
      const base = Math.max(0.9, R / 150);
      const alphas = [0.28, 0.5, 0.75, 0.95];
      const sizes = [0.7, 0.85, 1, 1.1];
      buckets.forEach((pts, b) => {
        if (!pts.length) return;
        const r = base * sizes[b];
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) {
          ctx.moveTo(pts[i] + r, pts[i + 1]);
          ctx.arc(pts[i], pts[i + 1], r, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${ACCENT}, ${alphas[b]})`;
        ctx.fill();
      });

      rings.forEach((r) => drawRing(r, R, cx, cy, true));

      // Satellite on the outer ring
      const a = t * 0.00035 + 0.8;
      const [sx, sy, sz] = ringXYZ(Math.cos(a), Math.sin(a), rings[0].k, rings[0].inc, rings[0].yaw);
      const hidden = sz < 0 && sx * sx + sy * sy < 1;
      if (!hidden) {
        const px = cx + sx * R, py = cy - sy * R;
        const halo = ctx.createRadialGradient(px, py, 0, px, py, 10);
        halo.addColorStop(0, `rgba(${ACCENT}, 0.55)`);
        halo.addColorStop(1, `rgba(${ACCENT}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(px - 10, py - 10, 20, 20);
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = sz < 0 ? `rgba(${ACCENT}, 0.5)` : '#e6fbff';
        ctx.fill();
      }
    };

    const frame = (now) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      rot += SPEED * (dt / 16.67);
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const update = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (motion.matches) { draw(0); return; }
      if (document.hidden || !onScreen) return; // paused, last frame stays on screen
      raf = requestAnimationFrame(frame);
    };

    resize();
    draw(0);
    update();

    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); });
    io.observe(wrap);
    document.addEventListener('visibilitychange', update);
    motion.addEventListener?.('change', update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
      motion.removeEventListener?.('change', update);
    };
  }, []);

  return (
    <div className="globe" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
