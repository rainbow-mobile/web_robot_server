export interface MovePayload {
  command: string;
  id: string | undefined;
  x: string | undefined;
  y: string | undefined;
  z: string | undefined;
  rz: string | undefined;
  preset: string | undefined;
  method: string | undefined;
  result: string | undefined;
}

export const defaultMovePayload: MovePayload = {
  command: '',
  id: undefined,
  x: undefined,
  y: undefined,
  z: undefined,
  rz: undefined,
  preset: undefined,
  method: undefined,
  result: undefined,
};
