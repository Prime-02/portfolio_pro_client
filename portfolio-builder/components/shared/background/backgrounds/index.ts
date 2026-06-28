// portfolio-builder/components/shared/background/backgrounds/index.ts

/**
 * Central import file for all background modules.
 * Importing this file registers every background type with the system.
 *
 * Usage:
 *   import "@/portfolio-builder/components/shared/background/backgrounds";
 *
 * Or import specific ones:
 *   import "./solid";
 *   import "./mesh";
 */

import "./none";
import "./solid";
import "./gradient";
import "./image";
import "./video";
import "./mesh";
import "./particles";
import "./aurora";
import "./balatro";
import "./ballpit";
import "./beams";
import "./colorBends";
import "./darkVeil";
import "./dither";
import "./dotField";
import "./dotGrid";
import "./antigravity";

// Re-export nothing — side-effect only
