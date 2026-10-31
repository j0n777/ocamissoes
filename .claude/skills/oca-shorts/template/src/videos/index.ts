import type { PonteSpec } from "../formatos/Ponte";
import { ErvaRastreio } from "./ErvaRastreio";

// Every video made from a ficha. Add the new spec here; Root registers one
// composition per entry (id = spec.id).
export const PONTES: PonteSpec[] = [ErvaRastreio];
