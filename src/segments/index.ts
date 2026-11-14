// segment registry — প্রতিটা segment নিজের ফাইলে; এখানে শুধু সময় ও component
import React from "react";
import { A01 } from "./A01";
import { A02 } from "./A02";
import { A02b } from "./A02b";
import { A03 } from "./A03";
import { A04 } from "./A04";
import { A05 } from "./A05";
import { A06 } from "./A06";
import { A07 } from "./A07";
import { A08 } from "./A08";
import { A09 } from "./A09";
import { A10 } from "./A10";
import { A11 } from "./A11";
import { A12 } from "./A12";
import { A13 } from "./A13";
import { A14 } from "./A14";
import { A15 } from "./A15";
import { A16 } from "./A16";
import { A17 } from "./A17";
import { A18 } from "./A18";
import { A19 } from "./A19";
import { A20 } from "./A20";
import { A21 } from "./A21";
import { A22 } from "./A22";
import { A23 } from "./A23";
import { A24 } from "./A24";
import { A25 } from "./A25";
import { A26 } from "./A26";

export type Seg = { id: string; start: number; end: number; Comp: React.FC };

export const SEGMENTS: Seg[] = [
  { id: "A01", start: 0.0, end: 5.12, Comp: A01 },
  { id: "A02", start: 5.12, end: 7.68, Comp: A02 },
  { id: "A02b", start: 7.68, end: 10.56, Comp: A02b },
  { id: "A03", start: 10.56, end: 13.2, Comp: A03 },
  { id: "A04", start: 13.2, end: 16.48, Comp: A04 },
  { id: "A05", start: 16.48, end: 21.52, Comp: A05 },
  { id: "A06", start: 21.52, end: 26.88, Comp: A06 },
  { id: "A07", start: 26.88, end: 32.4, Comp: A07 },
  { id: "A08", start: 32.4, end: 38.88, Comp: A08 },
  { id: "A09", start: 38.88, end: 44.56, Comp: A09 },
  { id: "A10", start: 44.56, end: 48.0, Comp: A10 },
  { id: "A11", start: 48.0, end: 53.6, Comp: A11 },
  { id: "A12", start: 53.6, end: 58.24, Comp: A12 },
  { id: "A13", start: 58.24, end: 63.04, Comp: A13 },
  { id: "A14", start: 63.04, end: 68.24, Comp: A14 },
  { id: "A15", start: 68.24, end: 72.0, Comp: A15 },
  { id: "A16", start: 72.0, end: 76.4, Comp: A16 },
  { id: "A17", start: 76.4, end: 79.12, Comp: A17 },
  { id: "A18", start: 79.12, end: 85.04, Comp: A18 },
  { id: "A19", start: 85.04, end: 91.44, Comp: A19 },
  { id: "A20", start: 91.44, end: 97.28, Comp: A20 },
  { id: "A21", start: 97.28, end: 100.16, Comp: A21 },
  { id: "A22", start: 100.16, end: 106.24, Comp: A22 },
  { id: "A23", start: 106.24, end: 108.88, Comp: A23 },
  { id: "A24", start: 108.88, end: 112.24, Comp: A24 },
  { id: "A25", start: 112.24, end: 117.68, Comp: A25 },
  { id: "A26", start: 117.68, end: 120.7, Comp: A26 },
];
