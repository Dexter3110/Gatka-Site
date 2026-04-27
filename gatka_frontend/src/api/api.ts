/**
 * api.ts  —  Drop this file into your React frontend at src/api/api.ts
 *
 * Provides typed helper functions for every backend endpoint.
 * Uses the JWT token stored in localStorage after login.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Token helpers ───────────────────────────────────────────

export const saveToken = (token: string) => localStorage.setItem("gatka_token", token);
export const getToken  = ()              => localStorage.getItem("gatka_token");
export const clearToken = ()             => localStorage.removeItem("gatka_token");

// ─── Base fetch wrapper ──────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type:   string;
  role:         string;
  full_name:    string;
  area_id:      number | null;
  area_name:    string | null;
}

export interface Area      { id: number; name: string; area_type: string; }
export interface User      { id: number; email: string; full_name: string; role: string; is_active: boolean; area_id: number | null; area: Area | null; created_at: string; }
export interface Player    { id: number; area_id: number; area: Area; full_name: string; father_name?: string; mother_name?: string; date_of_birth: string; gender: string; marital_status?: string; email?: string; phone_no?: string; whatsapp_no?: string; aadhar_no?: string; t_shirt_size?: string; address?: string; passport_photo_path?: string; is_active: boolean; created_at: string; }
export interface Competition { id: number; name: string; venue?: string; start_date: string; end_date?: string; registration_deadline?: string; status: string; description?: string; age_categories: AgeCategory[]; created_at: string; }
export interface AgeCategory { id: number; category_name: string; min_age?: number; max_age?: number; }
export interface Registration { id: number; competition_id: number; player_id: number; area_id: number; age_category?: string; event_group?: string; event_name?: string; status: string; registration_date: string; player: Player; }

// ─── Auth ────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
  apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiFetch<User>("/auth/me");

// ─── Dashboard ───────────────────────────────────────────────

export const getDashboardStats = () =>
  apiFetch<{ total_players: number; total_competitions: number; total_areas: number }>("/dashboard/stats");

// ─── Areas ───────────────────────────────────────────────────

export const listAreas = () => apiFetch<Area[]>("/users/areas/list");

// ─── Users (Admin only) ──────────────────────────────────────

export const listUsers = (params?: { role?: string; area_type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<User[]>(`/users/${q ? "?" + q : ""}`);
};

export const createUser = (data: {
  email: string; password: string; full_name: string;
  role: string; area_id?: number;
}) => apiFetch<User>("/users/", { method: "POST", body: JSON.stringify(data) });

export const updateUser = (id: number, data: Partial<{ full_name: string; password: string; is_active: boolean; area_id: number }>) =>
  apiFetch<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteUser = (id: number) =>
  apiFetch<void>(`/users/${id}`, { method: "DELETE" });

// ─── Players ─────────────────────────────────────────────────

export const listPlayers = (params?: { search?: string; gender?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Player[]>(`/players/${q ? "?" + q : ""}`);
};

export const getPlayer = (id: number) => apiFetch<Player>(`/players/${id}`);

/**
 * addPlayer uses FormData because it includes file uploads.
 * Build a FormData object and pass it here.
 */
export const addPlayer = (formData: FormData) =>
  apiFetch<Player>("/players/", { method: "POST", body: formData });

export const updatePlayer = (id: number, data: Partial<Player>) =>
  apiFetch<Player>(`/players/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePlayer = (id: number) =>
  apiFetch<void>(`/players/${id}`, { method: "DELETE" });

// ─── Competitions ────────────────────────────────────────────

export const listCompetitions = (status?: string) => {
  const q = status ? `?status=${status}` : "";
  return apiFetch<Competition[]>(`/competitions/${q}`);
};

export const getCompetition = (id: number) =>
  apiFetch<Competition>(`/competitions/${id}`);

export const createCompetition = (data: {
  name: string; venue?: string; start_date: string; end_date?: string;
  registration_deadline?: string; max_participants?: number;
  status: string; description?: string;
  age_categories: { category_name: string; min_age?: number; max_age?: number }[];
}) => apiFetch<Competition>("/competitions/", { method: "POST", body: JSON.stringify(data) });

export const updateCompetition = (id: number, data: Partial<Competition>) =>
  apiFetch<Competition>(`/competitions/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteCompetition = (id: number) =>
  apiFetch<void>(`/competitions/${id}`, { method: "DELETE" });

// ─── Registrations ───────────────────────────────────────────

export const listRegistrations = (params?: { competition_id?: number; area_id?: number }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Registration[]>(`/registrations/${q ? "?" + q : ""}`);
};

export const registerPlayer = (data: {
  competition_id: number; player_id: number;
  age_category?: string; event_group?: string; event_name?: string;
}) => apiFetch<Registration>("/registrations/", { method: "POST", body: JSON.stringify(data) });

export const removeRegistration = (id: number) =>
  apiFetch<void>(`/registrations/${id}`, { method: "DELETE" });

export const registrationSummary = (competition_id: number) =>
  apiFetch<{ area: string; area_type: string; total: number }[]>(
    `/registrations/summary?competition_id=${competition_id}`
  );

// ─── Example: Updated handleSubmit for App.tsx ───────────────
/*
Replace the mock login in App.tsx handleSubmit with:

import { login, saveToken } from './api/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const emailError   = validateEmail(email);
  const passwordError = validatePassword(password);
  const captchaError  = validateCaptcha(captchaInput);

  setErrors({ email: emailError, password: passwordError, captcha: captchaError });

  if (!emailError && !passwordError && !captchaError) {
    try {
      const result = await login(email, password);
      saveToken(result.access_token);
      setLoggedInEmail(email);
      setIsAdmin(result.role === 'admin');
      setShowDashboard(true);
    } catch (err: any) {
      setErrors({ ...errors, password: err.message });
      generateCaptcha();
    }
  }
};
*/
