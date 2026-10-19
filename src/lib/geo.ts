import type { Location } from "./types";

/** Centro aproximado de cada UF, para detectar o estado sem internet. */
const STATE_CENTROIDS: Record<string, [number, number]> = {
  AC: [-9.02, -70.81], AL: [-9.57, -36.78], AM: [-3.42, -65.86], AP: [1.41, -51.77],
  BA: [-12.58, -41.7], CE: [-5.5, -39.32], DF: [-15.78, -47.8], ES: [-19.58, -40.67],
  GO: [-15.83, -49.84], MA: [-5.06, -45.28], MG: [-18.51, -44.56], MS: [-20.77, -54.79],
  MT: [-12.68, -56.92], PA: [-3.98, -52.48], PB: [-7.24, -36.78], PE: [-8.33, -37.8],
  PI: [-7.72, -42.73], PR: [-24.89, -51.55], RJ: [-22.25, -42.66], RN: [-5.84, -36.67],
  RO: [-10.91, -62.96], RR: [2.08, -61.4], RS: [-30.03, -53.25], SC: [-27.25, -50.47],
  SE: [-10.57, -37.39], SP: [-22.26, -48.73], TO: [-10.18, -48.33],
};

export const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul", MT: "Mato Grosso",
  PA: "Pará", PB: "Paraíba", PE: "Pernambuco", PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo", TO: "Tocantins",
};

export const STATES = Object.keys(STATE_NAMES);

export function nearestState(lat: number, lon: number) {
  let best = "SP";
  let bestD = Infinity;
  for (const [uf, [la, lo]] of Object.entries(STATE_CENTROIDS)) {
    const d = (la - lat) ** 2 + ((lo - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < bestD) {
      bestD = d;
      best = uf;
    }
  }
  return best;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("sem-geolocalizacao"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 600000 });
  });
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  "ISO3166-2-lvl4"?: string;
}

/** Geocodificação reversa (OpenStreetMap). Falha em silêncio: o fallback é a UF mais próxima. */
async function reverseGeocode(lat: number, lon: number): Promise<{ state?: string; city?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=pt-BR`;
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) return {};
    const json = (await res.json()) as { address?: NominatimAddress };
    const a = json.address ?? {};
    const iso = a["ISO3166-2-lvl4"];
    const state = iso?.startsWith("BR-") ? iso.slice(3) : undefined;
    const city = a.city ?? a.town ?? a.municipality ?? a.village;
    return { state, city };
  } catch {
    return {};
  } finally {
    clearTimeout(t);
  }
}

export type GeoError = "negado" | "indisponivel";

export async function detectLocation(): Promise<Location> {
  let pos: GeolocationPosition;
  try {
    pos = await getPosition();
  } catch (e) {
    const code = (e as GeolocationPositionError | Error) as { code?: number };
    throw new Error(code.code === 1 ? "negado" : "indisponivel");
  }
  const { latitude: lat, longitude: lon } = pos.coords;
  const geo = await reverseGeocode(lat, lon);
  const state = geo.state && STATE_NAMES[geo.state] ? geo.state : nearestState(lat, lon);
  return { state, city: geo.city, lat: Number(lat.toFixed(3)), lon: Number(lon.toFixed(3)) };
}
