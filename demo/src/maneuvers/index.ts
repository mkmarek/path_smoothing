import { Path } from "../path";

import DynamicTurn from "./dynamic_turn";
import StaticTurn from "./static_turn";
import LinearMove from "./linear_move";
import { Maneuver } from "./maneuver";

// Construct a simple list of maneuvers that constists of a linear moves and a static turns
// Then start replacing the static turns with dynamic turns
export function create_maneuvers(path: Path, acceleration: number, angular_velocity: number): Maneuver[] {
  let maneuvers: Maneuver[] = [];

  for (let i = 0; i < path.nodes.length - 1; i++) {
    let begin = path.nodes[i];
    let end = path.nodes[i + 1];
    let mid = {
      x: (begin.x + end.x) / 2,
      y: (begin.y + end.y) / 2
    };

    let accelerate_move = new LinearMove(begin, mid, acceleration);
    maneuvers.push(accelerate_move);

    let decelerate_move = new LinearMove(mid, end, -acceleration, accelerate_move.get_end_velocity());
    maneuvers.push(decelerate_move);

    if (i < path.nodes.length - 2) {
      let next = path.nodes[i + 2];

      let curr_dx = end.x - begin.x;
      let curr_dy = end.y - begin.y;
      let curr_angle = Math.atan2(curr_dy, curr_dx);

      let dx = next.x - end.x;
      let dy = next.y - end.y;
      let next_angle = Math.atan2(dy, dx);

      let static_turn = new StaticTurn(curr_angle, next_angle, angular_velocity);
      maneuvers.push(static_turn);
    }
  }

  {
    let total_duration = 0;
    for (let i = 0; i < maneuvers.length; i++) {
      total_duration += maneuvers[i].get_duration();
    }
    console.log("Total duration: " + total_duration);
  }

  const skipStuff = false;

  if (!skipStuff) {
    for (let i = 0; i < maneuvers.length; i++) {
      const maneuver = maneuvers[i];

      if (maneuver instanceof StaticTurn) {
        const decelerate_move = maneuvers[i - 1] as LinearMove;
        const accelerate_move = maneuvers[i + 1] as LinearMove;
        
        const tt = find_minimum_turn_time(
          acceleration,
          maneuver.get_angular_velocity(),
          maneuver.get_end_angle(),
          maneuver.get_begin_angle(),
          decelerate_move.get_initial_velocity_length(),
          accelerate_move.get_begin_position().x,
          decelerate_move.get_begin_position().x,
          accelerate_move.get_begin_position().y,
          decelerate_move.get_begin_position().y,

          decelerate_move.get_duration(),
          accelerate_move.get_duration(),
        );

        if (!tt) {
          continue;
        }

        const [t, ang_vel] = tt;

        const t_leaving = calculate_t_in_leaving(
          t,
          decelerate_move.get_acceleration(),
          decelerate_move.get_initial_velocity_length(),
          accelerate_move.get_initial_velocity_length(),
          accelerate_move.get_acceleration());

        decelerate_move.set_duration(t);
        const turn = new DynamicTurn(
          decelerate_move.get_end_position(),
          maneuver.get_begin_angle(),
          maneuver.get_end_angle(),
          Math.abs(ang_vel),
          decelerate_move.get_end_velocity_length());

        accelerate_move.shorten_duration_by(t_leaving);
        accelerate_move.set_initial_velocity_length(decelerate_move.get_end_velocity_length());
        accelerate_move.set_begin_position(turn.get_end_position());

        maneuvers[i] = turn;
      }
    }
  }

  {
    let total_duration = 0;
    for (let i = 0; i < maneuvers.length; i++) {
      total_duration += maneuvers[i].get_duration();
    }
    console.log("Total duration: " + total_duration);
  }
  return maneuvers;
}

function find_minimum_turn_time(
  a: number,
  omega: number,
  theta_acc: number,
  theta_dec: number,
  v_0dec: number,
  x_0acc: number,
  x_0dec: number,
  y_0acc: number,
  y_0dec: number,

  decelare_duration: number,
  accelerate_duration: number,
): number[] {
  for (let i = 0.1; i <= Math.abs(omega); i += 0.1) {
    const [t1, t2] = calculate_time_of_turn(
      a,
      i * Math.sign(omega),
      theta_acc,
      theta_dec,
      v_0dec,
      x_0acc,
      x_0dec,
      y_0acc,
      y_0dec
    );

    const t = Math.min(t1, t2);

    if (t < 0) {
      continue;
    }

    if (decelare_duration < t) {
      continue;
    }

    const turn_v0 = v_0dec - a * t;
    const t_leaving = turn_v0 / a;

    if (t_leaving < 0) {
      continue;
    }

    if (accelerate_duration < t_leaving) {
      continue;
    }

    return [t, i * Math.sign(omega)];
  }

  return null;
}

function calculate_t_in_leaving(
  begin_of_turn: number,
  incomming_a: number,
  incomming_v0: number,
  leaving_v0: number,
  leaving_a: number,
): number {
  return (begin_of_turn * incomming_a + incomming_v0 - leaving_v0) / leaving_a
}

function calculate_time_of_turn(
  a: number,
  omega: number,
  theta_acc: number,
  theta_dec: number,
  v_0dec: number,
  x_0acc: number,
  x_0dec: number,
  y_0acc: number,
  y_0dec: number
): [number, number] {

  const x0 = Math.cos(theta_dec)
  const x1 = Math.sin(theta_acc)
  const x2 = x0 * x1
  const x3 = omega * x2
  const x4 = Math.cos(theta_acc)
  const x5 = Math.sin(theta_dec)
  const x6 = x4 * x5
  const x7 = omega * x6
  const x8 = x0 * x4
  const x9 = Math.pow(x4, 2)
  const x10 = Math.pow(a, 2)
  const x11 = 2 * x10
  const x12 = Math.pow(x0, 2)
  const x13 = x1 * x10
  const x14 = Math.pow(omega, 2)
  const x15 = a * x14
  const x16 = x14 * x9
  const x17 = a * x16
  const x18 = 2 * x15 * x2 * x4 - 2 * x17 * x5
  const x19 = -2 * x0 * (x15 - x17) + 2 * x1 * x15 * x6

  const prm = x4 * Math.sqrt(-(Math.pow(v_0dec, 2) * (-x12 * (x14 - 2 * x16) + 2 * x14 * x2 * x6 - x16) + x10 * x9 + x11 * x8 - x11 - x12 * (-x10 + x11 * x9) - x18 * y_0acc + x18 * y_0dec - x19 * x_0acc + x19 * x_0dec - 2 * x5 * (x13 * x8 - x13)) / x9);

  return [
    (a * x1 * x5 + a * x8 - a + v_0dec * (x3 - x7) + prm) / (a * x3 - a * x7),
    (a * x1 * x5 + a * x8 - a + v_0dec * (x3 - x7) - prm) / (a * x3 - a * x7)]
}
