'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';

import { formatNumber } from '@/lib/format';
import type { OutbreakPoint } from '@/types/outbreak';

type DarkOutbreakMapProps = {
  points: OutbreakPoint[];
};

function getCircleRadius(confirmed: number): number {
  if (confirmed <= 0) return 4;
  if (confirmed < 10) return 7;
  if (confirmed < 100) return 11;
  if (confirmed < 1000) return 17;
  if (confirmed < 10000) return 25;
  return 36;
}

function getCircleOpacity(confirmed: number): number {
  if (confirmed < 10) return 0.55;
  if (confirmed < 100) return 0.65;
  if (confirmed < 1000) return 0.72;
  return 0.82;
}

export function DarkOutbreakMap({ points }: DarkOutbreakMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05080b]">
      <MapContainer
        center={[28, 70]}
        zoom={3}
        minZoom={2}
        maxZoom={8}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        worldCopyJump
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={getCircleRadius(point.confirmed)}
            pathOptions={{
              color: '#ff0000',
              fillColor: '#e00000',
              fillOpacity: getCircleOpacity(point.confirmed),
              opacity: 0.8,
              weight: 1,
            }}
          >
            <Popup>
              <div className="min-w-44">
                <div className="text-sm font-bold text-neutral-950">{point.name}</div>
                <div className="mt-1 text-xs text-neutral-600">{point.country}</div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-neutral-500">Confirmed</div>
                    <div className="font-bold text-neutral-950">
                      {formatNumber(point.confirmed)}
                    </div>
                  </div>

                  <div>
                    <div className="text-neutral-500">Deaths</div>
                    <div className="font-bold text-neutral-950">
                      {formatNumber(point.deaths)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-neutral-200 pt-2 text-[11px] text-neutral-500">
                  Source: {point.source}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.08),rgba(0,0,0,0)_38%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.35))]" />

      <div className="pointer-events-none absolute left-4 top-4 z-[500] border border-white/10 bg-black/70 px-4 py-3 text-white shadow-2xl backdrop-blur">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
          Interactive Map
        </div>
        <div className="mt-1 text-sm font-semibold text-white">
          Outbreak locations by confirmed cases
        </div>
      </div>
    </div>
  );
}