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

// Existing backgrounds
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

// New backgrounds from pending_integration.txt
import "./faultyTerminal";
import "./floatingLines";
import "./galaxy";
import "./gradientBlinds";
import "./gridScan";
import "./laserFlow";
import "./letterGlitch";
import "./lightPillar";
import "./lightRays";
import "./lightfall";
import "./lineWaves";
import "./liquidChrome";
import "./liquidEther";
import "./noise";
import "./orb";
import "./particles";
import "./pixelBlast";
import "./pixelSnow";
import "./plasma";
import "./plasmaWave";
import "./prism";
import "./prismaticBurst";
import "./radar";
import "./rippleGrid";
import "./shapeGrid";
import "./sideRays";
import "./silk";
import "./softAurora";
import "./threads";
import "./waves";
import "./hyperspeed";

// Re-export nothing — side-effect only
