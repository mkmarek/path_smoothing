import { getCanvasContext } from "./canvas";
import { Path } from "./path";
import Agent from "./maneuvers/agent";

// const path = {
//   nodes: [
//     { x: 10, y: 500 },
//     { x: 50, y: 500 },
//     { x: 50, y: 460 },
//     { x: 10, y: 460 },
//     { x: 10, y: 420 },
//     { x: 60, y: 420 },
//     { x: 60, y: 500 },
//     { x: 60, y: 420 },
//     { x: 80, y: 450 },
//     { x: 100, y: 420 },
//     { x: 100, y: 500 },
//     { x: 150, y: 480 },
//     { x: 150, y: 430 },
//     { x: 110, y: 420 },
//     { x: 110, y: 500 },
//     { x: 140, y: 500 },
//     { x: 200, y: 480 },
//     { x: 200, y: 430 },
//     { x: 160, y: 420 },
//     { x: 160, y: 500 },
//     { x: 220, y: 500 },
//     { x: 220, y: 420 },
//     { x: 190, y: 420 },
//     { x: 250, y: 420 },
//     { x: 250, y: 500 },
//     { x: 250, y: 460 },
//     { x: 280, y: 460 },
//     { x: 280, y: 420 },
//     { x: 280, y: 520 },
//     { x: 10, y: 520 },
//   ].map((e) => ({ x: (e.x- 10) * 2 + 100, y: (e.y -500) * 2 + 300 })),
// }

function create_random_points(n: number, width: number, height: number): Path {
  const points = [];

  for (let i = 0; i < n; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height
    });
  }

  return { nodes: points };
}

const path = create_random_points(10, 800, 600);

console.log(path.nodes.map((e: any) => `Point(${e.x}, ${e.y})`).join(`,\n`));
const ctx = getCanvasContext();

const acceleration = 200.0;
const angular_velocity = 15.0;

const agent = new Agent(acceleration, angular_velocity, path);

let previous_update = 0;
const update = (time: number) => {
  ctx.clearRect(0, 0, 800, 600);

  const delta_time = (time - previous_update) / 1000;
  previous_update = time;

  agent.update(delta_time);
  agent.draw(ctx);

  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);


