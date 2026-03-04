"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE, INITIAL_VIEW, DEFAULT_COLOR } from "@/lib/constants";

type MapExpression = ["match", ["get", string], ...Array<string | string[]>];

interface VisaMapProps {
  colorExpression: MapExpression | string;
  onCountryClick: (code: string, name: string) => void;
}

export function VisaMap({ colorExpression, onCountryClick }: VisaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const readyRef = useRef(false);
  const clickHandlerRef = useRef(onCountryClick);
  clickHandlerRef.current = onCountryClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      minZoom: 1,
      maxZoom: 6,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("countries", {
        type: "geojson",
        data: "/data/countries.geojson",
      });

      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": DEFAULT_COLOR,
          "fill-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "countries-border",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#ffffff",
          "line-width": 0.8,
        },
      });

      readyRef.current = true;

      if (typeof colorExpression !== "string") {
        map.setPaintProperty("countries-fill", "fill-color", colorExpression as any);
      }
    });

    map.on("mouseenter", "countries-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "countries-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "countries-fill", (e: any) => {
      if (e.features?.length > 0) {
        const props = e.features[0].properties;
        if (props) {
          const code = props.ISO_A2_EH !== "-99" ? props.ISO_A2_EH : props.ISO_A2;
          clickHandlerRef.current(code, props.NAME || props.ADMIN || "");
        }
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update colors reactively
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    try {
      map.setPaintProperty("countries-fill", "fill-color", colorExpression as any);
    } catch {
      // Map may not be ready yet
    }
  }, [colorExpression]);

  return (
    <div ref={containerRef} className="absolute inset-0" />
  );
}
