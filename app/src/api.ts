import { subDays, format } from "date-fns";

const BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1";

export interface FuelHHData {
  startTime: string;
  generation: number;
  settlementDate: string;
  settlementPeriod: number;
}

export interface WindForData {
  startTime: string;
  publishTime: string;
  generation: number;
}

export const fetchActuals = async (
  fromDate: string,
  toDate: string,
): Promise<FuelHHData[]> => {
  const url = `${BASE_URL}/datasets/FUELHH/stream?settlementDateFrom=${fromDate}&settlementDateTo=${toDate}&fuelType=WIND`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch actuals");
  return response.json();
};

export const fetchForecasts = async (
  fromDate: string,
  toDate: string,
): Promise<WindForData[]> => {
  const pubFromDate =
    format(subDays(new Date(fromDate), 2), "yyyy-MM-dd") + "T00:00:00Z";
  const pubToDate = toDate + "T23:59:59Z";

  const url = `${BASE_URL}/datasets/WINDFOR/stream?publishDateTimeFrom=${pubFromDate}&publishDateTimeTo=${pubToDate}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch forecasts");
  return response.json();
};
