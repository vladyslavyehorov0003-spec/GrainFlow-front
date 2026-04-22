import { api } from "./api";
import { SpringPage } from "./workers";
import { CultureType } from "./batch";

export interface SiloResponse {
  id:            string;
  companyId:     string;
  name:          string;
  maxAmount:     number;
  currentAmount: number;
  culture:       CultureType | null;
  comment:       string | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface CreateSiloRequest {
  name:       string;
  maxAmount:  number;
  culture?:   CultureType;
  comment?:   string;
}

export interface UpdateSiloRequest {
  name?:          string;
  maxAmount?:     number;
  currentAmount?: number;
  culture?:       CultureType;
  comment?:       string;
}

export interface SiloFilterParams {
  culture?: CultureType;
  page?:    number;
  size?:    number;
  sort?:    string;
}

export async function getSilos(params?: SiloFilterParams): Promise<SpringPage<SiloResponse>> {
  const res = await api.get<{ data: SpringPage<SiloResponse> }>("/silos", { params });
  return res.data.data;
}

export async function createSilo(data: CreateSiloRequest): Promise<SiloResponse> {
  const res = await api.post<{ data: SiloResponse }>("/silos", data);
  return res.data.data;
}

export async function updateSilo(id: string, data: UpdateSiloRequest): Promise<SiloResponse> {
  const res = await api.patch<{ data: SiloResponse }>(`/silos/${id}`, data);
  return res.data.data;
}

export async function deleteSilo(id: string): Promise<void> {
  await api.delete(`/silos/${id}`);
}

export async function addGrain(id: string, labAnalysisId: string): Promise<SiloResponse> {
  const res = await api.patch<{ data: SiloResponse }>(`/silos/${id}/add-grain`, { labAnalysisId });
  return res.data.data;
}

export async function removeGrain(id: string, amount: number): Promise<SiloResponse> {
  const res = await api.patch<{ data: SiloResponse }>(`/silos/${id}/remove-grain`, { amount });
  return res.data.data;
}
