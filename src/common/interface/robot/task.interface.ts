export interface TaskPayload {
  connection: boolean;
  file: string;
  id: number;
  running: boolean;
  variables?: any[];
  result?: string | undefined;
}

// export const defaultTaskPayload: TaskPayload = {
//   connection: false,
//   file: '',
//   id: 0,
//   running: false,
//   variables: [],
//   result: undefined,
// };
