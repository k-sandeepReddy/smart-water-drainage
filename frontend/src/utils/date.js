/**
 * Indian Standard Time (IST) Date and Time Utilities
 * Timezone: Asia/Kolkata (UTC+05:30)
 *
 * Ensures all dates and times across the application strictly display
 * in Indian Standard Time in 12-hour format with AM/PM and optional IST suffix.
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats date/timestamp to IST full string: "M/D/YYYY, h:mm:ss A IST"
 * Example: "9/20/2026, 2:18:27 PM IST"
 */
export function formatISTDateTime(dateInput, includeSuffix = true) {
  if (!dateInput) return '—';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const formatted = formatter.format(date);
    return includeSuffix ? `${formatted} IST` : formatted;
  } catch (err) {
    console.error('Error formatting IST date:', err);
    return String(dateInput);
  }
}

/**
 * Formats date/timestamp to IST short string without seconds: "M/D/YYYY, h:mm A IST"
 * Example: "9/20/2026, 2:18 PM IST"
 */
export function formatISTDateTimeShort(dateInput, includeSuffix = true) {
  if (!dateInput) return '—';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const formatted = formatter.format(date);
    return includeSuffix ? `${formatted} IST` : formatted;
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Formats date only in IST: "M/D/YYYY"
 * Example: "9/20/2026"
 */
export function formatISTDateOnly(dateInput) {
  if (!dateInput) return '—';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    return formatter.format(date);
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Formats time only in IST: "h:mm:ss A IST"
 * Example: "2:18:27 PM IST"
 */
export function formatISTTimeOnly(dateInput, includeSuffix = true) {
  if (!dateInput) return '—';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const formatted = formatter.format(date);
    return includeSuffix ? `${formatted} IST` : formatted;
  } catch (err) {
    return String(dateInput);
  }
}
