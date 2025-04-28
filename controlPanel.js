// Control panel using dat.GUI for fire particles
import { initFireParticles } from './fireParticlesShader.js';

let fireLayer = null;

export function setupControlPanel(container) {
  // Load dat.GUI from CDN if not present
  if (!window.dat) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.min.js';
    script.onload = () => setupPanel();
    document.body.appendChild(script);
  } else {
    setupPanel();
  }

  function setupPanel() {
    const gui = new window.dat.GUI({ width: 300 });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '32px';
    gui.domElement.style.right = '24px';
    gui.domElement.style.zIndex = 10;
    gui.domElement.style.background = 'rgba(30,30,30,0.95)';
    gui.domElement.style.borderRadius = '10px';

    const params = {
      particleCount: 120,
      particleSize: 8.0,
      speed: 1.0,
      color: '#ffae23',
      brightness: 1.0
    };

    if (!fireLayer) {
      fireLayer = initFireParticles(container, params);
    }

    gui.add(params, 'particleCount', 20, 300, 1).onChange(val => {
      // For simplicity, reload fire layer on particle count change
      container.removeChild(fireLayer.renderer.domElement);
      fireLayer = initFireParticles(container, { ...params, particleCount: val });
    });
    gui.add(params, 'particleSize', 2, 20).onChange(val => fireLayer.setUniform('u_particleSize', val));
    gui.add(params, 'speed', 0.2, 3.0).onChange(val => fireLayer.setUniform('u_speed', val));
    gui.addColor(params, 'color').onChange(val => fireLayer.setUniform('u_color', new window.THREE.Color(val)));
    gui.add(params, 'brightness', 0.2, 2.0).onChange(val => fireLayer.setUniform('u_brightness', val));
  }
}
