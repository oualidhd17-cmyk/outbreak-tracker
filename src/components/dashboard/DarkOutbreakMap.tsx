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
    <div className="relative h-full w-full overflow-hidden bg-[#000]">
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
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: getCircleOpacity(point.confirmed),
              opacity: 0.8,
              weight: 1,
            }}
          >
            <Popup>
              <div className="min-w-44 text-white">
                <div className="text-sm font-bold text-white">{point.name}</div>
                <div className="mt-1 text-xs font-bold text-gray-400">{point.country}</div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Confirmed</div>
                    <div className="mt-0.5 font-mono text-lg font-bold text-red-500">
                      {formatNumber(point.confirmed)}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Deaths</div>
                    <div className="mt-0.5 font-mono text-lg font-bold text-white">
                      {formatNumber(point.deaths)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#333] pt-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Source: {point.source}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05),rgba(0,0,0,0)_40%),linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.4))]" />

      <div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-lg border border-[#333] bg-[#111]/90 px-4 py-3 text-white shadow-xl backdrop-blur-sm">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Interactive Map
        </div>
        <div className="mt-1 text-xs font-bold text-gray-200">
          Outbreak locations by confirmed cases
        </div>
      </div>
    </div>
  );
}