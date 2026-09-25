export type FlightTripType = 'Outbound Leg 1' | 'Outbound Leg 2' | 'Return Leg 1' | 'Return Leg 2';

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  tripType: FlightTripType;
  direction: 'outbound' | 'return';
  dayNumber: number;
  dateLabel: string;
  departureAirport: string;
  departureCity: string;
  departureAirportCode: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  departureTz: string;
  arrivalTz: string;
  duration: string;
  distanceKm: number;
  terminal: string;
  gate: string;
  boardingTime: string;
  seat: string;
  cabin: string;
  aircraft: string;
  aircraftShort: string;
  registrationHint: string;
  seatTip: string;
  luggageRule: string;
  transitNote?: string;
  photoUrl: string;
  photoCaption: string;
  status: 'Confirmed' | 'On Time';
  pnr: string;
  cruiseAltitudeFt: number;
  cruiseSpeedKmh: number;
}

export const ALL_FLIGHTS_DATA: FlightInfo[] = [
  {
    flightNumber: 'CX 632',
    airline: 'Cathay Pacific',
    airlineCode: 'CX',
    tripType: 'Outbound Leg 1',
    direction: 'outbound',
    dayNumber: 1,
    dateLabel: 'Sun 29 Sep 2026',
    departureAirport: 'Chennai International',
    departureCity: 'Chennai',
    departureAirportCode: 'MAA',
    arrivalAirport: 'Hong Kong International',
    arrivalCity: 'Hong Kong',
    arrivalAirportCode: 'HKG',
    departureTime: '01:50',
    arrivalTime: '09:45',
    departureTz: 'IST',
    arrivalTz: 'HKT',
    duration: '4h 25m',
    distanceKm: 3610,
    terminal: 'Terminal 1',
    gate: '14',
    boardingTime: '01:05',
    seat: '21K',
    cabin: 'Economy',
    aircraft: 'Airbus A350-900',
    aircraftShort: 'A350-900',
    registrationHint: 'B-LR* series',
    seatTip: 'Right side window seat (Row 18-24) for sunrise over the Bay of Bengal & SE Asia.',
    luggageRule: '2 checked bags up to 23kg each + 7kg cabin bag + 1 personal item.',
    transitNote: 'Bags are tagged through to NRT. At HKG follow "Transfer" signs — no need to re-check.',
    photoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600&auto=format&fit=crop',
    photoCaption: 'Cathay Pacific Airbus A350-900 cruising at 38,000 ft across the Asian corridor.',
    status: 'Confirmed',
    pnr: 'K7RQ2M',
    cruiseAltitudeFt: 38000,
    cruiseSpeedKmh: 903,
  },
  {
    flightNumber: 'CX 520',
    airline: 'Cathay Pacific',
    airlineCode: 'CX',
    tripType: 'Outbound Leg 2',
    direction: 'outbound',
    dayNumber: 1,
    dateLabel: 'Sun 29 Sep 2026',
    departureAirport: 'Hong Kong International',
    departureCity: 'Hong Kong',
    departureAirportCode: 'HKG',
    arrivalAirport: 'Tokyo Narita',
    arrivalCity: 'Tokyo',
    arrivalAirportCode: 'NRT',
    departureTime: '10:30',
    arrivalTime: '15:55',
    departureTz: 'HKT',
    arrivalTz: 'JST',
    duration: '4h 25m',
    distanceKm: 2960,
    terminal: 'Terminal 1',
    gate: '28',
    boardingTime: '09:50',
    seat: '34A',
    cabin: 'Economy',
    aircraft: 'Boeing 777-300ER',
    aircraftShort: '777-300ER',
    registrationHint: 'B-KP* series',
    seatTip: 'Left side window seat for dramatic views of Mount Fuji and Tokyo Bay upon descent.',
    luggageRule: 'Bags checked through from MAA directly to NRT carousel without re-check.',
    transitNote: 'Fill in Visit Japan Web (immigration + customs QR) during this leg — Wi‑Fi is available onboard.',
    photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
    photoCaption: 'Cathay Pacific widebody aircraft on final approach into Tokyo Narita (NRT).',
    status: 'Confirmed',
    pnr: 'K7RQ2M',
    cruiseAltitudeFt: 39000,
    cruiseSpeedKmh: 905,
  },
  {
    flightNumber: 'CX 503',
    airline: 'Cathay Pacific',
    airlineCode: 'CX',
    tripType: 'Return Leg 1',
    direction: 'return',
    dayNumber: 9,
    dateLabel: 'Wed 07 Oct 2026',
    departureAirport: 'Osaka Kansai International',
    departureCity: 'Osaka',
    departureAirportCode: 'KIX',
    arrivalAirport: 'Hong Kong International',
    arrivalCity: 'Hong Kong',
    arrivalAirportCode: 'HKG',
    departureTime: '10:00',
    arrivalTime: '13:00',
    departureTz: 'JST',
    arrivalTz: 'HKT',
    duration: '4h 00m',
    distanceKm: 2500,
    terminal: 'Terminal 1 · 4F',
    gate: '11',
    boardingTime: '09:20',
    seat: '19K',
    cabin: 'Economy',
    aircraft: 'Airbus A350-900',
    aircraftShort: 'A350-900',
    registrationHint: 'B-LR* series',
    seatTip: 'Right side window for scenic morning aerial views of Osaka Bay & Kobe coastline.',
    luggageRule: 'Bags checked through from KIX all the way to MAA (Chennai).',
    transitNote: 'Long HKG layover (8h). Consider the Airport Express into Central or the SkyCity lounges.',
    photoUrl: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?q=80&w=1600&auto=format&fit=crop',
    photoCaption: 'Cathay Pacific A350 lifting off from Kansai offshore airport island.',
    status: 'Confirmed',
    pnr: 'K7RQ2M',
    cruiseAltitudeFt: 37000,
    cruiseSpeedKmh: 898,
  },
  {
    flightNumber: 'CX 651',
    airline: 'Cathay Pacific',
    airlineCode: 'CX',
    tripType: 'Return Leg 2',
    direction: 'return',
    dayNumber: 9,
    dateLabel: 'Wed 07 Oct 2026',
    departureAirport: 'Hong Kong International',
    departureCity: 'Hong Kong',
    departureAirportCode: 'HKG',
    arrivalAirport: 'Chennai International',
    arrivalCity: 'Chennai',
    arrivalAirportCode: 'MAA',
    departureTime: '21:00',
    arrivalTime: '00:45 +1',
    departureTz: 'HKT',
    arrivalTz: 'IST',
    duration: '5h 15m',
    distanceKm: 3610,
    terminal: 'Terminal 1',
    gate: '42',
    boardingTime: '20:20',
    seat: '27C',
    cabin: 'Economy',
    aircraft: 'Airbus A350-900',
    aircraftShort: 'A350-900',
    registrationHint: 'B-LR* series',
    seatTip: 'Aisle seat recommended for comfort & easy stretching on the 5h evening return flight.',
    luggageRule: 'Duty-free liquids from KIX must remain sealed in official STEB security bags.',
    transitNote: 'Arrives after midnight — pre-book your Chennai airport pickup for 01:30 IST.',
    photoUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1600&auto=format&fit=crop',
    photoCaption: 'Long-range international twin-jet cruising through the evening sky back to Chennai.',
    status: 'Confirmed',
    pnr: 'K7RQ2M',
    cruiseAltitudeFt: 40000,
    cruiseSpeedKmh: 910,
  },
];

export const OUTBOUND_FLIGHTS = ALL_FLIGHTS_DATA.filter((f) => f.direction === 'outbound');
export const RETURN_FLIGHTS = ALL_FLIGHTS_DATA.filter((f) => f.direction === 'return');

/** Airport metadata for the route visualisation. */
export const AIRPORTS: Record<string, { city: string; country: string; flag: string; tz: string }> = {
  MAA: { city: 'Chennai', country: 'India', flag: '🇮🇳', tz: 'Asia/Kolkata' },
  HKG: { city: 'Hong Kong', country: 'Hong Kong SAR', flag: '🇭🇰', tz: 'Asia/Hong_Kong' },
  NRT: { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', tz: 'Asia/Tokyo' },
  KIX: { city: 'Osaka', country: 'Japan', flag: '🇯🇵', tz: 'Asia/Tokyo' },
};
