import { TimeTrackingRule } from './interfaces';
import { FallbackRule } from './fallback';
import { BrowserRule } from './browser';
import { NodeRule } from './node';

export const rules: TimeTrackingRule[] = [BrowserRule, NodeRule, FallbackRule];
