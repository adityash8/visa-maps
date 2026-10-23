"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { MAP_STYLE, INITIAL_VIEW, DEFAULT_COLOR } from "@/lib/constants";
import type { MapExpression } from "./use-map-colors";

interface VisaMapProps {
  colorExpression: MapExpression | string;
  onCountryClick: (code: string, name: string) => void;
}

export function VisaMap({ colorExpression, onCountryClick }: VisaMapProps) {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const clickHandlerRef = useRef(onCountryClick);
  const colorRef = useRef(colorExpression);

  const recordRenderedFrame = useCallback(function recordRenderedFrame(map: maplibregl.Map) {
    map.once("render", () => {
      const container = containerRef.current;
      if (!container || mapRef.current !== map || !map.getLayer("countries-fill")) return;
      const count = map.queryRenderedFeatures(undefined, { layers: ["countries-fill"] }).length;
      if (!count) { recordRenderedFrame(map); return; }
      setLoadState("ready");
      container.setAttribute("data-rendered-feature-count", String(count));
      container.setAttribute("data-rendered-fill-expression", JSON.stringify(map.getPaintProperty("countries-fill", "fill-color")));
      const point = map.project([2.2137, 46.2276]);
      container.setAttribute("data-france-point", JSON.stringify([point.x, point.y]));
    });
  }, []);

  useEffect(() => {
    clickHandlerRef.current = onCountryClick;
    colorRef.current = colorExpression;
  }, [onCountryClick, colorExpression]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const controller = new AbortController();
    function fail() {
      if (controller.signal.aborted) return;
      controller.abort();
      readyRef.current = false;
      mapRef.current = null;
      setLoadState("error");
    }

    maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: window.innerWidth < 768 ? [20, 30] : INITIAL_VIEW.center,
      zoom: window.innerWidth < 768 ? 1.2 : INITIAL_VIEW.zoom,
      minZoom: 1,
      maxZoom: 6,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("error", (event) => {
      if (!readyRef.current || ("sourceId" in event && event.sourceId === "countries")) fail();
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", async () => {
      try {
        const response = await fetch("/data/countries.geojson", { signal: controller.signal });
        if (!response.ok) throw new Error("Country boundaries unavailable");
        const countries: FeatureCollection = await response.json();
        if (controller.signal.aborted) return;
        map.addSource("countries", { type: "geojson", data: countries });
        map.addLayer({
          id: "countries-fill", type: "fill", source: "countries",
          paint: { "fill-color": DEFAULT_COLOR, "fill-opacity": 0.85 },
        });
        map.addLayer({
          id: "countries-border", type: "line", source: "countries",
          paint: { "line-color": "#ffffff", "line-width": 0.8 },
        });
        readyRef.current = true;
        container.setAttribute("data-map-ready", "true");
        map.setPaintProperty("countries-fill", "fill-color", colorRef.current);
        container.setAttribute("data-fill-expression", JSON.stringify(map.getPaintProperty("countries-fill", "fill-color")));
        recordRenderedFrame(map);
      } catch {
        fail();
      }
    });

    map.on("mouseenter", "countries-fill", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "countries-fill", () => { map.getCanvas().style.cursor = ""; });
    map.on("click", "countries-fill", (event) => {
      const props = event.features?.[0]?.properties;
      if (props) {
        const code = props.ISO_A2_EH !== "-99" ? props.ISO_A2_EH : props.ISO_A2;
        clickHandlerRef.current(code, props.NAME || props.ADMIN || "");
      }
    });

    return () => {
      controller.abort();
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      for (const attribute of ["data-map-ready", "data-fill-expression", "data-rendered-feature-count", "data-rendered-fill-expression", "data-france-point"]) container.removeAttribute(attribute);
    };
  }, [attempt, recordRenderedFrame]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    map.setPaintProperty("countries-fill", "fill-color", colorExpression);
    containerRef.current?.setAttribute("data-fill-expression", JSON.stringify(map.getPaintProperty("countries-fill", "fill-color")));
    recordRenderedFrame(map);
  }, [colorExpression, recordRenderedFrame]);

  return <div className="absolute inset-0">
    <div ref={containerRef} className="w-full h-full" hidden={loadState === "error"} />
    {loadState === "loading" && <p className="map-loading" role="status">Loading country boundaries…</p>}
    {loadState === "error" && <div className="map-error" role="alert"><p>Map couldn’t load. You can still use the destination list.</p><button className="button button-outline" onClick={() => { setLoadState("loading"); setAttempt((value) => value + 1); }}>Retry map</button></div>}
  </div>;
}
