export const PAST_SLOT_ERROR_MESSAGE =
    "This time slot has already passed. Please select an upcoming time slot.";

/**
 * Returns local calendar date in YYYY-MM-DD format (avoids UTC off-by-one issues).
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Parses the start time of a slot string in either 24-hour ("09:00-10:00", "14:30")
 * or 12-hour ("09:00 AM - 10:00 AM", "02:30 PM") format.
 */
export function parseSlotStartTime(
    slot: string,
): { hours: number; minutes: number } | null {
    if (!slot) return null;

    const rawStart = slot.includes("–")
        ? slot.split("–")[0]
        : slot.includes("-")
        ? slot.split("-")[0]
        : slot;

    const trimmed = rawStart.trim().toUpperCase();
    if (!trimmed) return null;

    const match12 = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/.exec(trimmed);
    if (match12) {
        let hours = parseInt(match12[1], 10);
        const minutes = parseInt(match12[2], 10);
        const period = match12[3];
        if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }
        if (period === "AM" && hours === 12) {
            hours = 0;
        } else if (period === "PM" && hours !== 12) {
            hours += 12;
        }
        return { hours, minutes };
    }

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
 * Checks whether a slot's start date/time has already passed relative to `now`.
 */
export function isSlotInPast(
    dateStr: string,
    slot: string,
    now: Date = new Date(),
): boolean {
    if (!dateStr || !slot) return false;
    const datePart = dateStr.trim().split("T")[0];
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!dateMatch) return false;

    const parsed = parseSlotStartTime(slot);
    if (!parsed) return false;

    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const day = parseInt(dateMatch[3], 10);

    const slotStart = new Date(year, month - 1, day, parsed.hours, parsed.minutes, 0, 0);
    return slotStart.getTime() <= now.getTime();
}
