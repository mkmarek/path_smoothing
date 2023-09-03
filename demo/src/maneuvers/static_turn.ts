import Agent from "./agent";
import { Maneuver } from "./maneuver";

export default class StaticTurn implements Maneuver {
  private start_angle: number;
  private duration: number;
  private elapsed: number;
  private angular_velocity: number;
  private min_angle_between: number;
  private end_angle: number;

  constructor(start_angle: number, end_angle: number, angular_velocity: number) {
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

    this.min_angle_between = turn_angle;
    this.end_angle = end_angle;
    this.start_angle = start_angle;
    this.duration = Math.abs(turn_angle / angular_velocity);
    this.elapsed = 0;
    this.angular_velocity = angular_velocity;
  }
  update(delta_time: number, agent: Agent): void {
    this.elapsed = Math.min(this.elapsed + delta_time, this.duration);
    agent.angle = this.start_angle + this.angular_velocity * this.elapsed;
  }
  get_angular_velocity(): number {
    return this.angular_velocity;
  }
  get_begin_angle(): number {
    return this.start_angle;
  }
  get_end_angle(): number {
    return this.end_angle;
  }
  reset(): void {
    this.elapsed = 0;
  }
  is_finished(): boolean {
    return this.elapsed >= this.duration;
  }
  get_duration(): number {
    return this.duration;
  }
  draw(ctx: CanvasRenderingContext2D) {
  }
}
