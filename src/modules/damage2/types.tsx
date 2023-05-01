import type { AC } from "@/damage/types";
import type { PMF } from "@utils/math";
import type { Flavor } from "@utils/typehelpers";

export type HitPMF = Flavor<PMF, "HitPMF">;
export type DamagePMF = Flavor<PMF, "DamagePMF">;

export type DamagePMFByAC = Map<AC, DamagePMF>;
