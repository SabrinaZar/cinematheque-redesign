import axios from "axios";
import { demoApi } from "./demoApi.js";

// La démo est opt-in : en mode normal, on conserve intégralement les routes Express.
const demo = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});


export const getFilms = (params = {}) => demo ? demoApi.getFilms(params) : api.get("/films", { params });
export const getFilm = (id) => demo ? demoApi.getFilm(id) : api.get(`/films/${id}`);
export const createFilm = (data) => demo ? demoApi.createFilm(data) : api.post("/films", data);
export const updateFilm = (id, data) => demo ? demoApi.updateFilm(id, data) : api.put(`/films/${id}`, data);
export const deleteFilm = (id) => demo ? demoApi.deleteFilm(id) : api.delete(`/films/${id}`);

export default api;
