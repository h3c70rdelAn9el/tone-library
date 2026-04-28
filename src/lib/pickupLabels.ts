import type { PickupType } from '../types/tone';

/** Human-readable pickup line for detail / chips. */
export function formatPickupLabel(
  pickupType?: PickupType,
  activePickups?: boolean,
): string {
  if (!pickupType) return '—';
  const base =
    pickupType === 'single_coil' ? 'Single coil' : 'Humbucker';
  if (activePickups) return `${base} · active`;
  return base;
}
