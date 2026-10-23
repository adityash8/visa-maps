import catalogue from "@/public/data/destinations.json";

export type Destination = { code: string; name: string };
export const destinations: Destination[] = catalogue;
export function destinationName(code: string) {
  return destinations.find((destination) => destination.code === code)?.name ?? code;
}
