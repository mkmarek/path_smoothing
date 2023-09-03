export function getCanvasContext(): CanvasRenderingContext2D {
  const body = document.querySelector('body');
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;

  const ctx = canvas.getContext('2d');

  body.appendChild(canvas);
  return ctx;
}
