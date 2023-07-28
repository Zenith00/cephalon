import type { Flavor } from "@/utils/typehelpers";
import type { PMF } from "./math";

export type AC = Flavor<number, 'AC'>
export type HitPMF = Flavor<PMF, "HitPMF">;
export type DamagePMF = Flavor<PMF, "DamagePMF">;

export type DamagePMFByAC = Map<AC, DamagePMF>;
