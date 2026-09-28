"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const toRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? new Float32Array([
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ])
    : new Float32Array([1, 1, 1]);
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 uResolution; uniform float uTime; uniform vec3 uLine; uniform vec3 uGlow;
out vec4 fragColor;
mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }
void main(){
  vec2 uv=(2.0*gl_FragCoord.xy-uResolution)/uResolution.y;
  float time=uTime*.2; vec3 color=vec3(.035,.018,.065);
  for(int i=1;i<5;i++){
    float f=float(i); vec2 p=rot(time*.25+f*.4)*uv;
    p+=.015*sin(p.yx*(3.0+f)+time*(.15+f*.08));
    float r=length(p); float angle=atan(p.y,p.x)+sin(r*5.0-time*1.2+f)*.1;
    p=vec2(cos(angle),sin(angle))*r;
    float lines=pow(max(0.,1.-abs(sin(p.x*(5.+f*2.)+sin(p.y*3.+time)))),16.);
    color+=uLine*lines/f;
    color+=uGlow*exp(-10.*abs(sin(p.x*3.+time+f)))*.8/f;
  }
  float vignette=1.-smoothstep(.35,1.45,length(uv)); color*=mix(.25,1.,vignette);
  fragColor=vec4(1.-exp(-color*2.),1.);
}`;

export default function GhostFibers({
  lineColor = "#672577",
  glowColor = "#b879cf",
  className = "",
}) {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return undefined;
    const renderer = new Renderer({
      webgl: 2,
      dpr: Math.min(window.devicePixelRatio, 1.5),
      antialias: false,
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    Object.assign(canvas.style, {
      width: "100%",
      height: "100%",
      display: "block",
    });
    container.appendChild(canvas);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: new Float32Array([1, 1]) },
        uTime: { value: 0 },
        uLine: { value: toRgb(lineColor) },
        uGlow: { value: toRgb(glowColor) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    let frame;
    let start = performance.now();
    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
    };
    const draw = (now) => {
      program.uniforms.uTime.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [lineColor, glowColor]);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  );
}
