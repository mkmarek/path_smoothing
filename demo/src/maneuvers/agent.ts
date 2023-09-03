import { create_maneuvers } from ".";
import { Path, Vec2 } from "../path";
import { Maneuver } from "./maneuver";

export default class Agent {
  public pos: Vec2;
  public angle: number;

  private maneuvers: Maneuver[];
  private maneuver_index: number;

  constructor(acceleration: number, angular_velocity: number, path: Path) {
    this.angle = 0;
    this.maneuvers = create_maneuvers(path, acceleration, angular_velocity);
    this.maneuver_index = 0;
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const maneuver of this.maneuvers) {
      maneuver.draw(ctx);
    }

    const arrow_size = 10;

    const front_x = this.pos.x + Math.cos(this.angle) * arrow_size;
    const front_y = this.pos.y + Math.sin(this.angle) * arrow_size;

    const left_x = this.pos.x + Math.cos(this.angle + Math.PI / 2) * arrow_size / 2;
    const left_y = this.pos.y + Math.sin(this.angle + Math.PI / 2) * arrow_size / 2;

    const right_x = this.pos.x + Math.cos(this.angle - Math.PI / 2) * arrow_size / 2;
    const right_y = this.pos.y + Math.sin(this.angle - Math.PI / 2) * arrow_size / 2;

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(front_x, front_y);
    ctx.lineTo(left_x, left_y);
    ctx.lineTo(right_x, right_y);
    ctx.closePath();
    ctx.fill();

  }
  update(delta_time: number) {
    if (this.maneuver_index >= this.maneuvers.length) {
      this.maneuver_index = 0;

      for (const maneuver of this.maneuvers) {
        maneuver.reset();
      }
    }

    const current_maneuver = this.maneuvers[this.maneuver_index];
    current_maneuver.update(delta_time, this);

    if (current_maneuver.is_finished()) {
      this.maneuver_index++;
    }
  }
}
