import { GiphyFetch } from "@giphy/js-fetch-api";

const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";

const gf = new GiphyFetch(API_KEY);

export default gf;