export const PAST_SLOT_ERROR_MESSAGE =
  'This time slot has already passed. Please select an upcoming time slot.';

/**
 * Parses a time string (24-hour like "14:00", "9:30", "14:00:00", or 12-hour like "02:00 PM")
 * or a slot range (like "09:00-10:00", "09:00 AM - 10:00 AM") and extracts the start hour & minute.
 */
export function parseSlotStartTime(
  timeStr: string,
): { hours: number; minutes: number } | null {
  if (!timeStr) return null;

  // If a range was passed, take the start part
  const rawStart = timeStr.includes('–')
    ? timeStr.split('–')[0]
    : timeStr.includes('-')
      ? timeStr.split('-')[0]
      : timeStr;

  const trimmed = rawStart.trim().toUpperCase();
  if (!trimmed) return null;

  // Match 12-hour format e.g. "09:00 AM", "2:30 PM", "12:00 AM"
  const match12 = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/.exec(trimmed);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];
    if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    } else if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    return { hours, minutes };
  }

  // Match 24-hour format e.g. "09:00", "14:30", "14:30:00"
  const match24 = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return { hours, minutes };
  }

  return null;
}

/**
 * Checks whether a booking slot's start date/time has already passed.
 * Uses APP_TIMEZONE_OFFSET (defaults to "+05:30" for IST) so validation is
 * accurate even when the server runs in UTC (e.g. Vercel / cloud containers).
 */
export function isSlotInPast(
  bookingDate: string | Date,
  startTime: string,
  now: Date = new Date(),
): boolean {
  const datePart =
    bookingDate instanceof Date
      ? bookingDate.toISOString().split('T')[0]
      : String(bookingDate || '').trim().split('T')[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return false;
  }

  const parsed = parseSlotStartTime(startTime);
  if (!parsed) {
    return false;
  }

  const hh = String(parsed.hours).padStart(2, '0');
  const mm = String(parsed.minutes).padStart(2, '0');
  const tzOffset = (process.env.APP_TIMEZONE_OFFSET || '+05:30').trim();

  const slotStart = new Date(`${datePart}T${hh}:${mm}:00${tzOffset}`);
  if (isNaN(slotStart.getTime())) {
    return false;
  }

  return slotStart.getTime() <= now.getTime();
}
