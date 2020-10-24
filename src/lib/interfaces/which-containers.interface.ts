import { PRE_HOOK, POST_HOOK } from '../which';
import { Container } from '../container';

export interface WhichContainers {
  [PRE_HOOK]: Container[];
  [POST_HOOK]: Container[];
}
