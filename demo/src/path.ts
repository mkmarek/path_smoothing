export interface Vec2 {
  x: number;
  y: number;
}

export interface Path {
  nodes: Vec2[];
}

export function draw_path(path: Path, ctx: CanvasRenderingContext2D, color: string = 'black') {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(path.nodes[0].x, path.nodes[0].y);
  for (let i = 1; i < path.nodes.length; i += 1) {
    ctx.lineTo(path.nodes[i].x, path.nodes[i].y);
  }
  ctx.stroke();
}
