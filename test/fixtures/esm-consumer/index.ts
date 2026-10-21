// Typechecked against the packed tarball under node16 ESM resolution.
import { SurrogateDelegate, wrapSurrogate } from 'surrogate';
import type { SurrogateOptions } from 'surrogate';
import * as Surrogate from 'surrogate';

// The ESM entry has no default export; TypeScript must not invent one.
// @ts-expect-error
import DefaultSurrogate from 'surrogate';

// @ts-expect-error
void Surrogate.default;

const options: SurrogateOptions = {};

export const Wrapped = SurrogateDelegate(options)(class Example {});
export const wrapped = wrapSurrogate({ run() {} }, options);
