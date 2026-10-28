import { Component, useEffect, useMemo, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Lead } from '@/types';
import { Link } from 'react-router-dom';
import { categoryColor } from '@/lib/utils';
import MapError from '@/components/MapError';

class MapBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <MapError /> : this.props.children;
  }
}

function createIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="
      display:inline-flex;align-items:center;justify-content:center;
      width:24px;height:24px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function Recenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

export default function BusinessMap({
  leads,
  height = '420px',
  focus,
  onMarkerClick,
}: {
  leads: Lead[];
  height?: string;
  focus?: { coordinates: { lat: number; lng: number }; zoom?: number } | null;
  onMarkerClick?: (l: Lead) => void;
}) {
  const markers = useMemo(() => leads.filter((l) => l.coordinates), [leads]);
  const center: [number, number] = focus?.coordinates
    ? [focus.coordinates.lat, focus.coordinates.lng]
    : markers.length
      ? [markers[0].coordinates!.lat, markers[0].coordinates!.lng]
      : [-14.235, -51.9253];

  return (
    <MapBoundary>
      <MapContainer
        center={center}
        zoom={focus?.zoom ?? 4}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuidores'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {focus && (
          <Recenter center={[focus.coordinates.lat, focus.coordinates.lng]} zoom={focus.zoom ?? 14} />
        )}
        {markers.map((l) => (
          <Marker
            key={l.id}
            position={[l.coordinates!.lat, l.coordinates!.lng]}
            icon={createIcon(categoryColor(l.category))}
            eventHandlers={{
              click: () => onMarkerClick?.(l),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-bold text-primary-800">{l.name}</p>
                <p className="text-xs text-stone-500">{l.category}</p>
                {l.city && (
                  <p className="text-xs text-stone-500">
                    {l.city} — {l.state}
                  </p>
                )}
                <Link
                  to={`/app/leads/${l.id}`}
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapBoundary>
  );
}
