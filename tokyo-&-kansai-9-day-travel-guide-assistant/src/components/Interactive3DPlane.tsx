import React from 'react';
import { FlightLeg } from '../types';
import { AirportTicketElement } from './AirportTicketElement';
import { ALL_FLIGHTS_DATA } from '../data/flightsData';

interface Interactive3DPlaneProps {
  flightLegs?: FlightLeg[];
  activeLegIndex?: number;
  onSelectLeg?: (index: number) => void;
  flightType?: 'outbound' | 'return';
  onSelectDay?: (dayNumber: number) => void;
}

/**
 * Thin adapter: maps (direction, leg index) → index in ALL_FLIGHTS_DATA
 * and renders the full Flight Deck.
 */
export const Interactive3DPlane: React.FC<Interactive3DPlaneProps> = ({ activeLegIndex = 0, flightType = 'outbound', onSelectDay }) => {
  const firstOfDirection = ALL_FLIGHTS_DATA.findIndex((f) => f.direction === flightType);
  const initialIndex = Math.max(0, firstOfDirection) + activeLegIndex;

  return <AirportTicketElement initialFlightIndex={initialIndex} onSelectDay={onSelectDay} />;
};
