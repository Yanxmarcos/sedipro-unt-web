// One deterministic seam makes the two sheets fit exactly, also during hydration.
const points = [];
let seed = 137;
for (let index = 0; index <= 100; index++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const irregularity = (seed / 4294967295 - .5) * 1.5;
  points.push([index, Number((50 + Math.sin(index * .29) * .55 + irregularity).toFixed(3))]);
}

const coordinates = (list, overlap) => list.map(([x, y]) => `${x}% ${y + overlap}%`).join(",");
export const TOP_TEAR = `polygon(0% 0%,100% 0%,${coordinates([...points].reverse(), .06)})`;
export const BOTTOM_TEAR = `polygon(${coordinates(points, -.06)},100% 100%,0% 100%)`;
export const TEAR_EDGE = points.map(([x, y], index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
