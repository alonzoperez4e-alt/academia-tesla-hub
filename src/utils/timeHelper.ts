export interface TimeUntil {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getTimeUntilNextMonday = (): TimeUntil => {
  const now = new Date();
  const nextMonday = new Date();

  let daysUntilMonday = (1 - now.getDay() + 7) % 7;
  if (daysUntilMonday === 0) daysUntilMonday = 7;

  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const difference = nextMonday.getTime() - now.getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};
