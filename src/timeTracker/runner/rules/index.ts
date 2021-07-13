import { TimeTrackingRule } from './interfaces';
import { BrowserRule } from './browser';
import { DefaultRule } from './default';
import { NodeRule } from './node';

export const rules: TimeTrackingRule[] = [BrowserRule, NodeRule, DefaultRule];
