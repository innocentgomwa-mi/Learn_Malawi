/**
 * Decorative 3D-style Earth globes orbiting the maintenance screen.
 * Pure CSS (no WebGL) for light weight and broad compatibility.
 */

const EARTH_TEXTURE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg";

/** @type {Array<{ radius: number; size: number; duration: number; tilt: number; delay: number; reverse?: boolean; opacity: number; offsetDeg?: number }>} */
const ORBITS = [
  { radius: 300, size: 72, duration: 32, tilt: 58, delay: 0, opacity: 0.92, offsetDeg: 0 },
  { radius: 380, size: 52, duration: 44, tilt: 68, delay: -6, reverse: true, opacity: 0.7, offsetDeg: 72 },
  { radius: 460, size: 88, duration: 52, tilt: 52, delay: -12, opacity: 0.85, offsetDeg: 144 },
  { radius: 260, size: 44, duration: 26, tilt: 74, delay: -4, reverse: true, opacity: 0.55, offsetDeg: 216 },
  { radius: 520, size: 60, duration: 58, tilt: 64, delay: -18, opacity: 0.65, offsetDeg: 288 },
  { radius: 340, size: 36, duration: 22, tilt: 78, delay: -10, reverse: true, opacity: 0.45, offsetDeg: 36 },
];

/**
 * @param {{ size: number; opacity: number; spinDuration: number }} props
 */
function GlobeSphere({ size, opacity, spinDuration }) {
  return (
    <div
      className="globe-sphere"
      style={{
        width: size,
        height: size,
        opacity,
      }}
    >
      <div
        className="globe-atmosphere"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          marginLeft: -(size * 0.075),
          marginTop: -(size * 0.075),
        }}
      />
      <div
        className="globe-surface"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${EARTH_TEXTURE})`,
          // @ts-ignore
          "--spin-duration": `${spinDuration}s`,
        }}
      />
      <div
        className="globe-shine"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}

export default function MaintenanceOrbitingGlobes() {
  return (
    <>
      <style>{`
        @keyframes maintenance-orbit {
          from { transform: rotateZ(0deg); }
          to { transform: rotateZ(360deg); }
        }
        @keyframes maintenance-orbit-rev {
          from { transform: rotateZ(360deg); }
          to { transform: rotateZ(0deg); }
        }
        @keyframes maintenance-globe-spin {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }
        .maintenance-orbit-field {
          perspective: 1400px;
          perspective-origin: 50% 50%;
        }
        .maintenance-orbit-ring {
          transform-style: preserve-3d;
          will-change: transform;
        }
        .maintenance-orbit-ring.orbit-fwd {
          animation: maintenance-orbit var(--orbit-duration) linear infinite;
        }
        .maintenance-orbit-ring.orbit-rev {
          animation: maintenance-orbit-rev var(--orbit-duration) linear infinite;
        }
        .globe-sphere {
          position: relative;
          transform-style: preserve-3d;
          transform: translateZ(12px);
        }
        .globe-atmosphere {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, rgba(147,197,253,0.35), rgba(30,58,138,0.15) 55%, transparent 70%);
          filter: blur(4px);
          pointer-events: none;
        }
        .globe-surface {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-size: 200% 100%;
          background-position: 0% 50%;
          animation: maintenance-globe-spin var(--spin-duration, 18s) linear infinite;
          box-shadow:
            inset -18px -14px 40px rgba(0, 20, 60, 0.75),
            inset 10px 8px 24px rgba(255, 255, 255, 0.12),
            0 0 28px rgba(59, 130, 246, 0.45),
            0 12px 32px rgba(0, 0, 0, 0.35);
        }
        .globe-shine {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 28% 22%, rgba(255,255,255,0.45) 0%, transparent 42%);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .maintenance-orbit-ring.orbit-fwd,
          .maintenance-orbit-ring.orbit-rev,
          .globe-surface {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="maintenance-orbit-field pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
        aria-hidden
      >
        {ORBITS.map((orbit, i) => {
          const diameter = orbit.radius * 2;
          const spinDuration = 14 + i * 3;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                width: diameter,
                height: diameter,
                marginLeft: -orbit.radius,
                marginTop: -orbit.radius,
                transform: `rotateX(${orbit.tilt}deg) rotateZ(${orbit.offsetDeg ?? 0}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className={`maintenance-orbit-ring relative h-full w-full ${orbit.reverse ? "orbit-rev" : "orbit-fwd"}`}
                style={{
                  // @ts-ignore custom property
                  "--orbit-duration": `${orbit.duration}s`,
                  animationDelay: `${orbit.delay}s`,
                }}
              >
                <div
                  className="absolute left-1/2 top-0"
                  style={{
                    transform: `translate(-50%, -${orbit.size / 2}px)`,
                  }}
                >
                  <GlobeSphere size={orbit.size} opacity={orbit.opacity} spinDuration={spinDuration} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
