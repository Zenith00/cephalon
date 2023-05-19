import { numberRange, type PMF } from "~/modules/damage2/math";
import type { Flavor } from "@/utils/typehelpers";

export type AC = Flavor<number, 'AC'>
export type HitPMF = Flavor<PMF, "HitPMF">;
export type DamagePMF = Flavor<PMF, "DamagePMF">;

export type DamagePMFByAC = Map<AC, DamagePMF>;
export const ACs = numberRange(1,30+1) as AC[];