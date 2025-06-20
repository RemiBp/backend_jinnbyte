import { format, addHours, parse, isValid, differenceInMinutes } from 'date-fns';

export const generateSlots = (
  start: string,
  end: string,
  hourLimit: number
): { startTime: string; endTime: string }[] => {
  const slots: { startTime: string; endTime: string }[] = [];
  const cleanStart = start.slice(0, 5);
  const cleanEnd = end.slice(0, 5);

  let current = parse(cleanStart, 'HH:mm', new Date());
  const endTime = parse(cleanEnd, 'HH:mm', new Date());

  if (!isValid(current) || !isValid(endTime)) {
    console.warn('Invalid time input', { start, end });
    return [];
  }

  if (current >= endTime) {
    console.warn('Start time is not before end time', { start, end });
    return [];
  }

  const slotDurationInMinutes = hourLimit * 60;

  while (current < endTime) {
    const minutesRemaining = differenceInMinutes(endTime, current);
    if (minutesRemaining < slotDurationInMinutes) {
      break;
    }

    const next = addHours(current, hourLimit);
    slots.push({
      startTime: format(current, 'HH:mm'),
      endTime: format(next, 'HH:mm'),
    });
    current = next;
  }

  return slots;
};
