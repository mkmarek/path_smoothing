import { Path, Vec2 } from "../path";
import Agent from "./agent";
import { Maneuver } from "./maneuver";

export default class LinearMove implements Maneuver {
  private start_position: Vec2;
  private duration: number;
  private acceleration_num: number;
  private acceleration: Vec2;
  private elapsed: number;
  private initial_velocity: Vec2;
  private angle: number;
  private is_accelerating: boolean;
  private direction: Vec2;

  constructor(
    start_position: Vec2,
    end_position: Vec2,
    acceleration: number,
    initial_velocity: Vec2 = { x: 0, y: 0 }) {

    const distance = Math.sqrt(
      (end_position.x - start_position.x) * (end_position.x - start_position.x) +
      (end_position.y - start_position.y) * (end_position.y - start_position.y));

    const direction = {
      x: (end_position.x - start_position.x) / distance,
      y: (end_position.y - start_position.y) / distance
    };


    this.direction = direction;
    this.is_accelerating = acceleration > 0;
    this.start_position = start_position;
    this.angle = Math.atan2(direction.y, direction.x);
    this.duration = Math.sqrt(Math.abs(2 * distance / acceleration));
    this.acceleration = { x: direction.x * acceleration, y: direction.y * acceleration };
    this.acceleration_num = acceleration;
    this.elapsed = 0;
    this.initial_velocity = initial_velocity;
  }

  get_begin_position() {
    return this.start_position; 
  }

  get_end_position() {
    return this.get_point_at(this.duration);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = this.is_accelerating ? "green" : "red";
    ctx.moveTo(this.start_position.x, this.start_position.y);
    const end_position = this.get_point_at(this.duration);
    ctx.lineTo(end_position.x, end_position.y);
    ctx.stroke();
  }

  get_acceleration(): number {
    return this.acceleration_num;
  }

  set_duration(duration: number) {
    this.duration = duration;
  }

  shorten_duration_by(amount: number) {
    this.duration -= amount;
  }

  get_initial_velocity_length(): number {
    return Math.sqrt(
      this.initial_velocity.x * this.initial_velocity.x +
      this.initial_velocity.y * this.initial_velocity.y);
  }

  set_initial_velocity_length(length: number) {
    this.initial_velocity.x = this.direction.x * length
    this.initial_velocity.y = this.direction.y * length;
  }

  set_begin_position(position: Vec2) {
    this.start_position = position;
  }

  set_begin_velocity(velocity: Vec2) {
    this.initial_velocity = velocity;
  }

  get_duration(): number {
    return this.duration;
  }

  get_end_velocity(): Vec2 {
    let x = this.initial_velocity.x +
      this.acceleration.x * this.duration;

    let y = this.initial_velocity.y +
      this.acceleration.y * this.duration;

    let velocity = { x, y };

    return velocity;
  }

  get_end_velocity_length(): number {
    const velocity = this.get_end_velocity();
    return Math.sqrt(
      velocity.x * velocity.x +
      velocity.y * velocity.y);
  }

  reset(): void {
    this.elapsed = 0;
  }

  get_point_at(t: number): Vec2 {
    let x = this.start_position.x +
      this.initial_velocity.x * t +
      0.5 * this.acceleration.x * t * t;

    let y = this.start_position.y +
      this.initial_velocity.y * t +
      0.5 * this.acceleration.y * t * t;

    let position = { x, y };

    return position;
  }

  get_angle(): number {
    return (this.angle+ 2*Math.PI) % (2*Math.PI)
  }

  update(delta_time: number, agent: Agent): void {

    this.elapsed += delta_time;
    this.elapsed = Math.min(this.elapsed, this.duration);

    let x = this.start_position.x +
      this.initial_velocity.x * this.elapsed +
      1.0 / 2.0 * this.acceleration.x * this.elapsed * this.elapsed;

    let y = this.start_position.y +
      this.initial_velocity.y * this.elapsed +
      1.0 / 2.0 * this.acceleration.y * this.elapsed * this.elapsed;

    let pos = { x, y };
    agent.pos = pos;
    agent.angle = this.angle;
  }

  is_finished(): boolean {
    return this.elapsed >= this.duration;
  }
}
