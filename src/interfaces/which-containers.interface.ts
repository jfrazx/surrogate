import { Container, PRE_HOOK, POST_HOOK } from '../lib';

export interface WhichContainers {
  [PRE_HOOK]: Container[];
  [POST_HOOK]: Container[];
}
