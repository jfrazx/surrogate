import type { SurrogateHandlerContainer } from '../../../containers';

/**
 * @description Sorts Surrogate handler containers based on their priority
 *
 * @template T
 * @param {SurrogateHandlerContainer<T>} a
 * @param {SurrogateHandlerContainer<T>} b
 */
export const containerSorter = <T extends object>(
  a: SurrogateHandlerContainer<T>,
  b: SurrogateHandlerContainer<T>,
) =>
  a.options.priority === b.options.priority
    ? 0
    : a.options.priority > b.options.priority
    ? -1
    : 1;
