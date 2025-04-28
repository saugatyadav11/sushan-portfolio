// Fire Particles Shader Layer using Three.js
// This script creates a canvas overlay with animated fire-like particles

import * as THREE from 'three';

let scene, camera, renderer, particleSystem, uniforms;

export function initFireParticles(container, options = {}) {
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0x000000, 0); // transparent
  renderer.setSize(width, height);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = 0;
  renderer.domElement.style.left = 0;
  renderer.domElement.style.pointerEvents = 'none';

  container.appendChild(renderer.domElement);

  // Shader uniforms
  uniforms = {
    u_time: { value: 0.0 },
    u_particleCount: { value: options.particleCount || 120 },
    u_particleSize: { value: options.particleSize || 8.0 },
    u_speed: { value: options.speed || 1.0 },
    u_color: { value: new THREE.Color(options.color || '#ffae23') },
    u_brightness: { value: options.brightness || 1.0 },
    u_resolution: { value: new THREE.Vector2(width, height) }
  };

  // Geometry for points
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(uniforms.u_particleCount.value * 3);
  for (let i = 0; i < uniforms.u_particleCount.value; i++) {
    positions[i * 3] = (Math.random() - 0.5) * width;
    positions[i * 3 + 1] = Math.random() * height * 0.3 - height * 0.4;
    positions[i * 3 + 2] = 0;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Shader material
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      uniform float u_time;
      uniform float u_speed;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        float t = u_time * u_speed + float(gl_VertexID);
        pos.y += mod(t * 30.0 + pos.x * 0.01, 400.0) * 0.5;
        vAlpha = 1.0 - (pos.y + 200.0) / 400.0;
        vAlpha = clamp(vAlpha, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = u_particleSize * vAlpha;
      }
    `,
    fragmentShader: `
      uniform vec3 u_color;
      uniform float u_brightness;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.1, d) * vAlpha * u_brightness;
        gl_FragColor = vec4(u_color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  animate();

  function animate() {
    uniforms.u_time.value = performance.now() * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  return {
    setUniform: (name, value) => {
      if (uniforms[name]) uniforms[name].value = value;
    },
    getUniform: (name) => uniforms[name]?.value,
    renderer,
    scene,
    camera
  };
}
