import { Path, Vec2 } from "../path";
import Agent from "./agent";
import { Maneuver } from "./maneuver";

export default class DynamicTurn implements Maneuver {
  private start_angle: number;
  private duration: number;
  private elapsed: number;
  private angular_velocity: number;
  private initial_velocity: number;
  private initial_position: Vec2;

  constructor(
    initial_position: Vec2,
    start_angle: number,
    end_angle: number,
    angular_velocity: number,
    initial_velocity: number) {

    start_angle = (start_angle + 2 * Math.PI) % (2 * Math.PI);
    end_angle = (end_angle + 2 * Math.PI) % (2 * Math.PI);

    let raw_difference = end_angle - start_angle;
    let turn_angle = Math.abs(raw_difference) % (2 * Math.PI);

    if (turn_angle > Math.PI) {
      turn_angle = 2 * Math.PI - turn_angle;
      raw_difference = -raw_difference
    }

    if (raw_difference < 0) {
      angular_velocity = -angular_velocity;
    }

    this.initial_position = initial_position;
    this.start_angle = start_angle;
    this.duration = Math.abs(turn_angle / angular_velocity);
    this.elapsed = 0;
    this.angular_velocity = angular_velocity;
    this.initial_velocity = initial_velocity;
  }
  get_duration(): number {
    return this.duration;
  }
  update(delta_time: number, agent: Agent): void {
    this.elapsed = Math.min(this.elapsed + delta_time, this.duration);
    agent.angle = this.start_angle + this.angular_velocity * this.elapsed;

    const pos = point_on_movement_spiral_integrated(
      this.start_angle,
      this.initial_velocity,
      this.angular_velocity,
      0, // no acceleration for now
      this.elapsed);

    agent.pos = {
      x: this.initial_position.x + pos.x,
      y: this.initial_position.y + pos.y
    };
  }
  get_end_position(): Vec2 {
    const pos = point_on_movement_spiral_integrated(
      this.start_angle,
      this.initial_velocity,
      this.angular_velocity,
      0, // no acceleration for now
      this.duration);

    return {
      x: this.initial_position.x + pos.x,
      y: this.initial_position.y + pos.y
    };
  }
  is_finished(): boolean {
    return this.elapsed >= this.duration;
  }
  reset(): void {
    this.elapsed = 0;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const resolution = 100;
    const acceleration = 0.000;


    for (let i = 0; i < resolution; i++) {
      const t = i / resolution * this.duration;
      const t_next = (i + 1) / resolution * this.duration;

      const pos = point_on_movement_spiral_integrated(
        this.start_angle,
        this.initial_velocity,
        this.angular_velocity,
        acceleration, 
        t);

      const pos_next = point_on_movement_spiral_integrated(
        this.start_angle,
        this.initial_velocity,
        this.angular_velocity,
        acceleration,
        t_next);

      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.moveTo(
        this.initial_position.x + pos.x,
        this.initial_position.y + pos.y);
      ctx.lineTo(
        this.initial_position.x + pos_next.x,
        this.initial_position.y + pos_next.y);
      ctx.stroke();
    }
  }
}

function point_on_movement_spiral_integrated(
  initial_angle: number,
  initial_velocity: number,
  angular_velocity: number,
  acceleration: number,
  t: number): Vec2 {
  let x = ((acceleration * angular_velocity * t + angular_velocity * initial_velocity) * Math.sin(angular_velocity * t + initial_angle) + acceleration *
    Math.cos(angular_velocity * t + initial_angle) - angular_velocity * Math.sin(initial_angle) * initial_velocity - acceleration * Math.cos(initial_angle)) / Math.pow(angular_velocity, 2);

  let y = (acceleration * Math.sin(angular_velocity * t + initial_angle) + (-acceleration * angular_velocity * t - angular_velocity * initial_velocity) *
    Math.cos(angular_velocity * t + initial_angle) + angular_velocity * Math.cos(initial_angle) * initial_velocity - acceleration * Math.sin(initial_angle)) / (Math.pow(angular_velocity, 2));

  return { x, y };
}

