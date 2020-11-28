import { INext } from '../next';

/**
 *
 */
export type SurrogateHandler<T extends object> = (
  next?: INext<T>,
  arg1?: any,
  arg2?: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any,
  arg7?: any,
  arg8?: any,
) => any;
