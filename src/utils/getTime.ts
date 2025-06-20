export function getCurrentTimeInUTCFromTimeZone(timeZone: string) {
  const now = new Date();
  const dateInTargetTZ = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const getPart = (type: string) => dateInTargetTZ.find(p => p.type === type)?.value;

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  const localDateTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const dateInUTC = new Date(localDateTimeString + 'Z');

  return dateInUTC.toISOString();
}

export function toStartOfDay(dateString: string): string {
  const date = new Date(dateString);
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  return startOfDay.toISOString();
}

export function getTodayDateInTimeZone(timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}
