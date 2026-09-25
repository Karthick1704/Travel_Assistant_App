// Utility functions for multi-timezone clocks and trip countdown

// Departure: Cathay Pacific CX 632 departs Chennai (MAA) on Sep 29, 2026 at 01:50 AM IST
export const TRIP_START_DATE_ISO = '2026-09-29T01:50:00+05:30';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isStarted: boolean;
}

export interface WorldClockTime {
  timeStr: string; // e.g. "01:50:45 AM"
  dateStr: string; // e.g. "Sun, Sep 29"
  offsetStr: string; // e.g. "UTC+5:30"
  label: string; // e.g. "India (IST)"
  sublabel: string; // e.g. "Chennai (MAA)"
  flag: string; // e.g. "🇮🇳"
  tzCode: string; // "Asia/Kolkata"
  hoursDiffFromIst: string; // e.g. "Local Base", "+2.5 hrs", "+3.5 hrs"
}

export const TIMEZONES: Array<{
  key: 'ist' | 'hkt' | 'jst';
  tzCode: string;
  name: string;
  label: string;
  sublabel: string;
  flag: string;
  offset: string;
  diffFromIst: string;
}> = [
  {
    key: 'ist',
    tzCode: 'Asia/Kolkata',
    name: 'India Standard Time',
    label: 'India (IST)',
    sublabel: 'Chennai • MAA Airport',
    flag: '🇮🇳',
    offset: 'UTC+5:30',
    diffFromIst: 'Origin Time',
  },
  {
    key: 'hkt',
    tzCode: 'Asia/Hong_Kong',
    name: 'Hong Kong Time',
    label: 'Hong Kong (HKT)',
    sublabel: 'HKG Transit Hub',
    flag: '🇭🇰',
    offset: 'UTC+8:00',
    diffFromIst: '+2.5 hrs vs India',
  },
  {
    key: 'jst',
    tzCode: 'Asia/Tokyo',
    name: 'Japan Standard Time',
    label: 'Japan (JST)',
    sublabel: 'Tokyo & Osaka Destination',
    flag: '🇯🇵',
    offset: 'UTC+9:00',
    diffFromIst: '+3.5 hrs vs India',
  },
];

export function getCountdown(targetIso: string = TRIP_START_DATE_ISO): CountdownTime {
  const targetTime = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isStarted: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isStarted: false,
  };
}

export function getWorldClockTime(tzCode: string, date: Date = new Date()): { timeStr: string; dateStr: string } {
  try {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzCode,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzCode,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      timeStr: timeFormatter.format(date),
      dateStr: dateFormatter.format(date),
    };
  } catch {
    return {
      timeStr: '--:--:--',
      dateStr: '',
    };
  }
}
