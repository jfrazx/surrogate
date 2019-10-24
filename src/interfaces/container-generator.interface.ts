import { Container } from '../container';

export interface ContainerGenerator {
  value: Container;
  done: boolean;
}
