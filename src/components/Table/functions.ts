import type { CryptoDataType, ResponseDataType } from "./types.ts";
import axios from "axios";

export function transformData(data: ResponseDataType[], sort: string): CryptoDataType[] {
  const transformed = data.map((item, index) => ({
    key: item.market_cap_rank || index + 1,
    name: item.name,
    logo: item.image,
    symbol: item.symbol.toUpperCase(),
    price: `$${item.current_price ? item.current_price.toFixed(2) : 0}`,
    priceChange: `${item.price_change_percentage_24h ? item.price_change_percentage_24h.toFixed(2) : 0}%`,
    marketCap: `$${item.market_cap ? item.market_cap.toLocaleString() : "0"}`,
    volume: `$${item.total_volume ? item.total_volume.toLocaleString() : "0"}`,
    rawPrice: item.current_price || 0,
    sparkline: item.sparkline_in_7d?.price || [], // Данные для графика
    priceChangeColor: item.price_change_percentage_24h >= 0 ? '#52c41a' : '#ff4d4f', // Цвет для графика
  }));

  switch (sort) {
    case "price_asc":
      return transformed.sort((a, b) => a.rawPrice - b.rawPrice);
    case "price_desc":
      return transformed.sort((a, b) => b.rawPrice - a.rawPrice);
    case "volume_asc":
      return transformed.sort((a, b) =>
          parseFloat(a.volume.replace(/[^0-9.]/g, '')) -
          parseFloat(b.volume.replace(/[^0-9.]/g, '')));
    case "volume_desc":
      return transformed.sort((a, b) =>
          parseFloat(b.volume.replace(/[^0-9.]/g, '')) -
          parseFloat(a.volume.replace(/[^0-9.]/g, '')));
    default:
      return transformed;
  }
}

export async function fetchData(page: number, sort: string) {
  const apiSortMap: Record<string, string> = {
    'market_cap_asc': 'market_cap_asc',
    'market_cap_desc': 'market_cap_desc',
    'volume_asc': 'volume_asc',
    'volume_desc': 'volume_desc',
    'id_asc': 'id_asc',
    'id_desc': 'id_desc',
    'price_asc': 'market_cap_desc',
    'price_desc': 'market_cap_desc'
  };

  const apiSort = apiSortMap[sort] || 'market_cap_desc';

  try {
    const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${apiSort}&per_page=10&page=${page}&sparkline=true&price_change_percentage=24h`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-xhuqgroKH4AQtUQ57kJewM7n",
          },
        }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function fetchChartData(coinId: string, days: number = 7) {
  try {
    const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-xhuqgroKH4AQtUQ57kJewM7n",
          },
        }
    );
    return data.prices.map((item: [number, number]) => item[1]);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}