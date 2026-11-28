import {
  AmbientLight, BackSide, CanvasTexture, DirectionalLight, FrontSide, Group, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, NoToneMapping, PerspectiveCamera, PlaneGeometry, Scene,
  SRGBColorSpace, Texture, WebGLRenderer,
} from "three";

export function createPosterPeel(canvas, stage, image, message) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, .1, 30);
  const group = new Group();
  const height = 3.2;
  const width = height * image.naturalWidth / image.naturalHeight;
  const geometry = new PlaneGeometry(width, height, 60, 60);
  const flat = new PlaneGeometry(width, height);
  const position = geometry.attributes.position;
  const original = new Float32Array(position.array);
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  const front = new MeshStandardMaterial({ map: texture, side: FrontSide, roughness: .88 });
  const back = new MeshStandardMaterial({ color: "#e2d8c2", side: BackSide, roughness: .97 });
  const paper = document.createElement("canvas");
  paper.width = 1080;
  paper.height = 1350;
  const ink = paper.getContext("2d");
  ink.fillStyle = "#fffbe9";
  ink.fillRect(0, 0, paper.width, paper.height);
  ink.fillStyle = "#8f0500";
  ink.font = "italic bold 55px Georgia, serif";
  ink.textAlign = "center";
  const lines = [""];
  for (const word of message.split(" ")) {
    const line = lines.at(-1);
    const next = line ? `${line} ${word}` : word;
    if (line && ink.measureText(next).width > 940) lines.push(word);
    else lines[lines.length - 1] = next;
  }
  lines.forEach((line, index) => ink.fillText(line, 540, 1290 - (lines.length - 1 - index) * 65));
  const paperTexture = new CanvasTexture(paper);
  paperTexture.colorSpace = SRGBColorSpace;
  const backing = new MeshBasicMaterial({ map: paperTexture });
  const base = new Mesh(flat, backing);
  base.position.z = -.003;
  base.renderOrder = -1;
  group.add(base, new Mesh(geometry, front), new Mesh(geometry, back));
  const key = new DirectionalLight("#fff3df", 1.4);
  key.position.set(-3, 5, 7);
  scene.add(group, new AmbientLight("#ffffff", 1.2), key);

  const phi = 24 * Math.PI / 180;
  const kx = Math.sin(phi), ky = -Math.cos(phi);
  const ix = -ky, iy = kx;
  const bottom = -height / 2 * ky, top = -bottom;
  const radius = .13 * height, theta = 158 * Math.PI / 180;
  const arc = radius * theta, sag = -.0032 / height * 100;
  let progress = 0, from = 0, target = 0, elapsed = 0, previous = 0;
  let frame = 0, paused = false, covered = false;

  function render() {
    const cut = bottom - progress * .52 * (bottom - top);
    for (let index = 0; index < original.length; index += 3) {
      const x = original[index], y = original[index + 1];
      const d = x * kx + y * ky;
      if (progress === 0 || d <= cut) {
        position.setXYZ(index / 3, x, y, 0);
        continue;
      }
      const across = x * ix + y * iy, u = d - cut;
      const angle = u <= arc ? u / radius : theta + (u - arc) * sag;
      const distance = u <= arc ? radius * Math.sin(angle) :
        radius * Math.sin(theta) + (Math.sin(angle) - Math.sin(theta)) / sag;
      const depth = u <= arc ? radius * (1 - Math.cos(angle)) :
        radius * (1 - Math.cos(theta)) - (Math.cos(angle) - Math.cos(theta)) / sag;
      position.setXYZ(index / 3, across * ix + (cut + distance) * kx, across * iy + (cut + distance) * ky, depth);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = 0;
    const duration = target > from ? 1100 : 450;
    elapsed += previous ? now - previous : 0;
    previous = now;
    const t = Math.min(1, elapsed / duration);
    const eased = target > from ? 1 - (1 - t) ** 4 : t ** 4;
    progress = t === 1 ? target : from + (target - from) * eased;
    render();
    schedule();
  }

  function schedule() {
    if (paused || covered || document.hidden || progress === target) {
      cancelAnimationFrame(frame);
      frame = previous = 0;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.position.z = camera.aspect < .65 ? 15 : camera.aspect < 1 ? 10.3 : 8.6;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    render();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const ownDialog = stage.closest("dialog");
  const modals = new MutationObserver(() => {
    const dialogs = [...document.querySelectorAll("dialog:modal")];
    covered = dialogs.some(dialog => dialog !== ownDialog);
    schedule();
  });
  modals.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  document.addEventListener("visibilitychange", schedule);
  resize();
  return {
    peel(value) {
      from = progress;
      target = value ? .9 : 0;
      elapsed = previous = 0;
      schedule();
    },
    dispose() {
      paused = true;
      schedule();
      document.removeEventListener("visibilitychange", schedule);
      resizeObserver.disconnect();
      modals.disconnect();
      for (const resource of [geometry, flat, texture, paperTexture, front, back, backing, renderer]) resource.dispose();
    },
  };
}
