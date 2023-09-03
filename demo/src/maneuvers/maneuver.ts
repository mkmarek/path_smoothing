import Agent from "./agent";

export interface Maneuver {
  draw: (ctx: CanvasRenderingContext2D) => void;
  update(delta_time: number, agent: Agent): void;
  is_finished(): boolean;
  reset(): void;
  get_duration(): number;
}
