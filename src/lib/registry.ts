// সব group-এর item এক জায়গায় (প্রতিটা group নিজের index.tsx-এ ITEMS export করে)
import { LibItem } from "./types";
import { ITEMS as DEVICES } from "./devices";
import { ITEMS as SCREENS_SEARCH } from "./screens_search";
import { ITEMS as SCREENS_CHAT } from "./screens_chat";
import { ITEMS as SCREENS_SITES } from "./screens_sites";
import { ITEMS as SCREENS_BUSINESS } from "./screens_business";
import { ITEMS as MONEY } from "./money";
import { ITEMS as PLACES } from "./places";
import { ITEMS as CHARACTERS } from "./characters";
import { ITEMS as ICONS } from "./icons";
import { ITEMS as DATAVIZ } from "./dataviz";
import { ITEMS as EFFECTS } from "./effects";
import { ITEMS as SCENES } from "./scenes";
import { ITEMS as SCENES_A } from "./scenes_a";
import { ITEMS as SCENES_B } from "./scenes_b";
import { ITEMS as SCENES_C } from "./scenes_c";
import { ITEMS as SCENES_D } from "./scenes_d";
import { ITEMS as SCENES_E } from "./scenes_e";
import { ITEMS as SCENES_F } from "./scenes_f";
import { ITEMS as SCENES_G } from "./scenes_g";
import { ITEMS as SCENES_H } from "./scenes_h";

export const LIB: LibItem[] = [...DEVICES, ...SCREENS_SEARCH, ...SCREENS_CHAT, ...SCREENS_SITES, ...SCREENS_BUSINESS, ...MONEY, ...PLACES, ...CHARACTERS, ...ICONS, ...DATAVIZ, ...EFFECTS, ...SCENES, ...SCENES_A, ...SCENES_B, ...SCENES_C, ...SCENES_D, ...SCENES_E, ...SCENES_F, ...SCENES_G, ...SCENES_H];
export const byId = (id: string) => LIB.find((x) => x.id === id);
