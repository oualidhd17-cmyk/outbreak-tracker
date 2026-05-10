'use client';

import { useEffect } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

import { formatNumber } from '@/lib/format';
import type { OutbreakPoint } from '@/types/outbreak';

type DarkOutbreakMapProps = {
  points: OutbreakPoint[];
};

function getCircleRadius(point: OutbreakPoint): number {
  const total = point.total_identified ?? point.confirmed;

  if (total <= 0) return 7;
  if (total < 10) return 10;
  if (total < 100) return 14;
  if (total < 1000) return 20;
  if (total < 10000) return 28;

  return 38;
}

function getCircleOpacity(point: OutbreakPoint): number {
  const total = point.total_identified ?? point.confirmed;

  if (total < 10) return 0.68;
  if (total < 100) return 0.74;
  if (total < 1000) return 0.8;

  return 0.86;
}

function isValidPoint(point: OutbreakPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  );
}

function MapAutoFocus({ points }: { points: OutbreakPoint[] }) {
  const map = useMap();

  useEffect(() => {
    // التركيز يتم بناءً على النقاط الصحيحة والتي بها إصابات فقط
    const validPoints = points.filter(isValidPoint).filter((point) => {
      const total = point.total_identified ?? point.confirmed;
      const suspected = point.suspected ?? 0;
      return total > 0 || suspected > 0 || point.deaths > 0;
    });

    if (validPoints.length === 0) {
      map.setView([20, 0], 2, {
        animate: true,
      });
      return;
    }

    if (validPoints.length === 1) {
      const point = validPoints[0];
      map.setView([point.lat, point.lng], 4, {
        animate: true,
      });
      return;
    }

    const bounds = validPoints.map((point) => [
      point.lat,
      point.lng,
    ]) as LatLngBoundsExpression;

    map.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: 5,
      animate: true,
    });
  }, [map, points]);

  return null;
}

export function DarkOutbreakMap({ points }: DarkOutbreakMapProps) {
  // التعديل هنا: فلترة النقاط الصفرية حتى لا تظهر على الخريطة
  const validPoints = points.filter(isValidPoint).filter((point) => {
    const total = point.total_identified ?? point.confirmed;
    const suspected = point.suspected ?? 0;
    return total > 0 || suspected > 0 || point.deaths > 0;
  });

  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        worldCopyJump
      >
        <MapAutoFocus points={validPoints} />

        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {validPoints.map((point) => {
          const total = point.total_identified ?? point.confirmed;
          const suspected = point.suspected ?? 0;
          const unconfirmed = point.unconfirmed ?? suspected;

          return (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={getCircleRadius(point)}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: getCircleOpacity(point),
                opacity: 0.9,
                weight: 1.3,
              }}
            >
              <Popup>
                <div className="min-w-56 text-slate-950">
                  <div className="text-sm font-black text-slate-950">
                    {point.name}
                  </div>

                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {point.country}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Confirmed
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-black text-red-600">
                        {formatNumber(point.confirmed)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Suspected
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-black text-amber-600">
                        {formatNumber(suspected)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Total
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-black text-slate-950">
                        {formatNumber(total)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Deaths
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-black text-slate-950">
                        {formatNumber(point.deaths)}
                      </div>
                    </div>
                  </div>

                  {unconfirmed > 0 ? (
                    <div className="mt-3 rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700">
                      Unconfirmed signals: {formatNumber(unconfirmed)}
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-slate-200 pt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Source: {point.source}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05),rgba(0,0,0,0)_40%),linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.4))]" />

      <div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-lg border border-[#333] bg-[#111]/90 px-4 py-3 text-white shadow-xl backdrop-blur-sm">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Interactive Map
        </div>
        <div className="mt-1 text-xs font-bold text-gray-200">
          Outbreak locations by confirmed and suspected signals
        </div>
      </div>
    </div>
  );
}