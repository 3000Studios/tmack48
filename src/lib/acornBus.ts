type Listener = (count: number) => void;

let count = 0;
const listeners = new Set<Listener>();

export function getAcornLandingCount(): number {
  return count;
}

export function incrementAcornLandingCount(delta = 1): number {
  count = Math.max(0, count + delta);
  for (const fn of listeners) fn(count);
  return count;
}

export function subscribeAcornLandingCount(fn: Listener): () => void {
  listeners.add(fn);
  fn(count);
  return () => listeners.delete(fn);
}

