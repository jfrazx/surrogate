import { SurrogateUnwrapped } from './surrogate';
import { TimeTracker } from '../timeTracker';

export interface ProviderParameters<T extends object> {
  instance: SurrogateUnwrapped<T>;
  timeTracker: TimeTracker;
  correlationId: string;
  originalArgs: any[];
  receivedArgs: any[];
  currentArgs: any[];
  hookType: string;
  action: string;
  error?: Error;
  provide: any;
  result: any;
}
