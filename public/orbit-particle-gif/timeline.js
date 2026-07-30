export const FRAME_DURATIONS = [...Array(59).fill(60), 30];
export const LOOP_DURATION = FRAME_DURATIONS.reduce(
  (total, duration) => total + duration,
  0,
);

export function frameAt(elapsedMilliseconds) {
  const normalized =
    ((elapsedMilliseconds % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;
  let boundary = 0;

  for (let frameIndex = 0; frameIndex < FRAME_DURATIONS.length; frameIndex += 1) {
    boundary += FRAME_DURATIONS[frameIndex];
    if (normalized < boundary) return frameIndex;
  }

  return 0;
}
