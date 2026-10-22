import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MattkaOrbCanvasProps {
  className?: string;
  interactive?: boolean;
  isHero?: boolean;
}

export const MattkaOrbCanvas: React.FC<MattkaOrbCanvasProps> = ({
  className = '',
  interactive = true,
  isHero = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isHeroRef = useRef<boolean>(isHero);
  isHeroRef.current = isHero;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, aspect, 1, 1000);
    camera.position.set(0, 0, 50);

    // ========================================================
    // RICHARD MATTKA ORIGINAL SHADERS (orb1.js + BackgroundVertexShader.js)
    // ========================================================
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec2 iMouse;
      uniform float audio1;
      uniform float adj;
      uniform sampler2D iChannel0;
      uniform float orbOpacity;
      uniform float intensity;

      #define R(p, a) p = p * cos(a) + vec2(-p.y, p.x) * sin(a)
      #define time iTime * 0.1 
      #define tau 6.2831853

      mat2 makem2(in float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat2(c, -s, s, c);
      }

      float noise(in vec2 x) {
        return texture2D(iChannel0, x * 0.01).x;
      }

      mat2 m2 = mat2(0.80, 0.80, -0.80, 0.80);

      float grid(vec2 p) {
        return sin(p.x) * cos(p.y);
      }

      float flow(in vec2 p) {
        float z = 4.0;
        float rz = 0.0;
        vec2 bp = p;
        for (float i = 1.0; i < 8.0; i++) {
          bp += time * 1.5;
          vec2 gr = vec2(grid(p * 3.0 - time * 2.0), grid(p * 3.0 + 4.0 - time)) * 0.4;
          gr = normalize(gr) * 0.4;
          gr *= makem2((p.x + p.y) * 0.3 + time * 10.0);
          p += gr * 0.2;
          
          rz += (sin(noise(p) * 2.0) * 0.5 + 0.5) / z;
          
          p = mix(bp, p, 0.5);
          z *= 1.5;
          p *= 2.5;
          p *= m2;
          bp *= 2.5;
          bp *= m2;
        }
        return rz;  
      }

      float spiral(vec2 p, float scl) {
        float r = length(p);
        r = log(max(r, 0.0001));
        float a = atan(p.y, p.y);
        return abs(mod(scl * (r - 2.0 / scl * a), tau) - 1.0) * 1.0;
      }

      float Sin01(float t) {
        return 0.5 + 0.5 * sin(6.28319 * t);
      }

      float SineEggCarton(vec3 p) {
        return 0.0 + abs(sin(p.x) - cos(p.y) + sin(p.z)) * 1.2 * orbOpacity;
      }

      float Map(vec3 p, float scale) {
        float dSphere = length(p) - 1.0;
        return max(dSphere, (0.9 - SineEggCarton(scale * p)) / scale);
      }

      vec3 GetColor(vec3 p) {
        float amount = clamp((1.5 - length(p)) / 2.0, 0.0, 1.0);
        vec3 col = 0.5 + 0.5 * cos(6.28319 * (vec3(0.20, 0.0, 0.0) + amount * (audio1 * 0.6) * vec3(0.90, 0.88, 0.78)));
        return col * amount * orbOpacity;
      }

      void main() {
        vec2 coord = gl_FragCoord.xy;
        coord.x -= (iMouse.x * 0.003);
        coord.y += (iMouse.y * 0.003);

        vec2 p = coord / iResolution.xy - 0.5;
        p.x *= iResolution.x / iResolution.y;
        p *= 2.0;
        p.y += 1.5;
        float rz = flow(p);
        p /= exp(mod(2.1, 2.1));
        rz *= (3.2 - spiral(p, 0.5)) * 0.7 * audio1;
        
        // Refined celestial aura: velvety deep midnight with smooth cosmic flow, zero white/harsh blowout
        float safeRz = max(abs(rz), 0.28);
        vec3 col = vec3(0.016, 0.035, 0.075) / safeRz;
        col = clamp(col, 0.006, 0.24);
        col = pow(abs(col), vec3(1.01)) - (abs(iMouse.x) * 0.00005);
        
        // Deep velvety obsidian cosmos base
        gl_FragColor = vec4(col, 1.0);

        vec3 rd = normalize(vec3(2.0 * coord - iResolution.xy, -iResolution.y));

        vec3 ro = vec3(
          -iMouse.x * 0.0003,
          iMouse.y * 0.0002,
          -1.4 * (1.0 - orbOpacity) - 0.5 + mix(2.5, 2.0, clamp(adj, -1.5, 0.5) + Sin01(0.05 * iTime))
        );

        R(rd.xz, 0.2 * iTime);
        R(ro.xz, 0.2 * iTime);
        R(rd.yz, 0.1 * iTime);
        R(ro.yz, 0.1 * iTime);
        
        float t = 0.0;
        float scale = mix(0.5, 20.0 * (orbOpacity * orbOpacity), Sin01(0.1 * iTime * 0.01));
        
        // Volumetric Raymarching with incandescent chamber accumulation
        for (int i = 0; i < 60; i++) {
          vec3 pPos = ro + t * rd;
          float d = Map(pPos, scale);
          if (t > 20.0 || d < 0.0001) {
            break;
          }
          t += 0.7 * d;
          gl_FragColor.rgb += (0.055 * GetColor(pPos) * (audio1 * 0.65)) * orbOpacity;
          gl_FragColor.r -= (abs(iMouse.x) * 0.00003);
        }
      }
    `;

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const noiseTex = textureLoader.load('/textures/tex1.png');
    noiseTex.wrapS = THREE.RepeatWrapping;
    noiseTex.wrapT = THREE.RepeatWrapping;
    noiseTex.minFilter = THREE.LinearFilter;
    noiseTex.magFilter = THREE.LinearFilter;

    const backgroundUniforms = {
      iTime: { value: 100.0 },
      iResolution: { value: new THREE.Vector2(width, height) },
      iMouse: { value: new THREE.Vector2(0, 0) },
      audio1: { value: 2.7 },
      adj: { value: 0.2 - height / width },
      orbOpacity: { value: isHero ? 1.0 : 0.3 },
      intensity: { value: 1.0 },
      iChannel0: { value: noiseTex },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: backgroundUniforms,
      depthTest: false,
      depthWrite: false,
    });

    const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shaderMaterial);
    backgroundPlane.scale.set(110 * aspect, 110, 1);
    scene.add(backgroundPlane);

    // ========================================================
    // RICHARD MATTKA ORIGINAL AMBIENT SPRITE PARTICLES (350 points)
    // ========================================================
    const spriteTex = textureLoader.load('/textures/sprite1.png');
    const particleGeo = new THREE.BufferGeometry();
    const particleVertices: number[] = [];
    for (let i = 0; i < 350; i++) {
      const px = Math.random() * 60 - 30;
      const py = Math.random() * 60 - 30;
      const pz = Math.random() * 60 - 30;
      particleVertices.push(px, py, pz);
    }
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));

    const pMat1 = new THREE.PointsMaterial({
      size: 0.35,
      map: spriteTex,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.35,
      color: new THREE.Color(0.3, 0.7, 0.9),
    });

    const pMat2 = new THREE.PointsMaterial({
      size: 0.35,
      map: spriteTex,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.30,
      color: new THREE.Color(0.3, 0.3, 0.8),
    });

    const particles1 = new THREE.Points(particleGeo, pMat1);
    particles1.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(particles1);

    const particles2 = new THREE.Points(particleGeo.clone(), pMat2);
    particles2.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(particles2);

    // Mouse Tracking (Pixels relative to center, exactly as Mattka main.js)
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouse.x = e.clientX - window.innerWidth / 2;
      mouse.y = e.clientY - window.innerHeight / 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || !e.touches[0]) return;
      const touch = e.touches[0];
      mouse.x = touch.clientX - window.innerWidth / 2;
      mouse.y = touch.clientY - window.innerHeight / 2;
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const asp = w / h;
      camera.aspect = asp;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      backgroundPlane.scale.set(110 * asp, 110, 1);
      backgroundUniforms.iResolution.value.set(w, h);
      backgroundUniforms.adj.value = 0.2 - h / w;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;
    let isHidden = document.hidden;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
      if (!isHidden) {
        clock.getDelta(); // Reset clock delta on wake-up to prevent animation jumps
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (isHidden) return; // GPU Sleep: completely halt WebGL raymarching on background tabs
      animationFrameId = requestAnimationFrame(animate);

      const d = Math.min(clock.getDelta(), 0.1);

      backgroundUniforms.iTime.value += d;
      backgroundUniforms.audio1.value = 128.0 / 48.0 + Math.random() * 0.1;

      backgroundUniforms.iMouse.value.x += (mouse.x - backgroundUniforms.iMouse.value.x) * 0.05;
      backgroundUniforms.iMouse.value.y += (mouse.y - backgroundUniforms.iMouse.value.y) * 0.05;

      // Smooth transition of orbOpacity (1.0 on Hero, 0.3 on inner tabs)
      const targetOpacity = isHeroRef.current ? 1.0 : 0.3;
      backgroundUniforms.orbOpacity.value +=
        (targetOpacity - backgroundUniforms.orbOpacity.value) * 0.06;

      // Rotate ambient stardust sprites
      const tVal = backgroundUniforms.iTime.value;
      particles1.rotation.z = -0.03 * tVal;
      particles2.rotation.z = 0.02 * tVal;

      // Gentle camera parallax
      camera.position.x += (-mouse.x * 0.01 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.01 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      backgroundPlane.geometry.dispose();
      shaderMaterial.dispose();
      particleGeo.dispose();
      pMat1.dispose();
      pMat2.dispose();
      noiseTex.dispose();
      spriteTex.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ background: '#05070f' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle glass veil for inner tabs: preserves celestial stardust & living glow while guaranteeing 100% text readability */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out ${
          isHero
            ? 'opacity-0 bg-transparent'
            : 'opacity-70 bg-[#05070f]/70 backdrop-blur-[1px]'
        }`}
      />
    </div>
  );
};

export default MattkaOrbCanvas;