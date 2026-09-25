export type CategoryType = 'essential' | 'electronics' | 'documents' | 'clothing' | 'special';

export interface ChecklistItem {
  id: string;
  text: string;
  category: CategoryType;
  tip: string;
  checked?: boolean;
}

export interface TransitStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  lineBadge?: string;
  badgeColor?: string;
  duration?: string;
}

export interface RouteGuide {
  from: string;
  to: string;
  recommendedTransit: string;
  estimatedTime: string;
  costEstimate?: string;
  stepByStep: TransitStep[];
  googleMapsQuery: string;
  taxiNote?: string;
}

export interface GoogleReviewsSummary {
  rating: number;
  reviewCount: string;
  keyHighlights: string[];
  bestTimeToVisit: string;
  secretTip: string;
  quote: string;
  reviewerBadge?: string;
}

export interface DosAndDonts {
  dos: string[];
  donts: string[];
}

export interface LanguageHack {
  id: string;
  japanese: string;
  romaji: string;
  meaning: string;
  context: string;
  category: 'courtesy' | 'transit' | 'dining' | 'shopping' | 'emergency';
}

export interface FlightLeg {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  terminal?: string;
  gate?: string;
  seatTip?: string;
  luggageRule?: string;
}

export interface ItineraryDay {
  id: number;
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  subtitle: string;
  locationArea: string;
  city: 'Tokyo' | 'Hakone/Fuji' | 'Osaka' | 'Kyoto' | 'Tango Peninsula';
  themeColor: string;
  accentGradient: string;
  iconName: string;
  hasFlightTicket?: boolean;
  flightLegs?: FlightLeg[];
  summary: string;
  schedule: Array<{
    time: string;
    activity: string;
    detail: string;
    highlight?: boolean;
  }>;
  routeGuide: RouteGuide;
  checklist: ChecklistItem[];
  googleReviews: GoogleReviewsSummary;
  dosAndDonts: DosAndDonts;
  culturalTips: string[];
  transitAlert: {
    status: 'Smooth' | 'Peak Hours Alert' | 'Weather Dependent' | 'Reservation Needed';
    message: string;
    icCardAccepted: boolean;
  };
  recommendedPhrases: LanguageHack[];
}
