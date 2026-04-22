import { api } from "./api";
import { SpringPage } from "./workers";
import { CultureType } from "./batch";

export type VehicleStatus = "ARRIVED" | "IN_PROCESS" | "PENDING_REVIEW" | "ACCEPTED" | "REJECTED";

export interface VehicleResponse {
  id:                   string;
  companyId:            string;
  batchId:              string;
  licensePlate:         string;
  driverName:           string | null;
  culture:              CultureType;
  declaredVolume:       number;
  status:               VehicleStatus;
  arrivedAt:            string;
  unloadingStartedAt:   string | null;
  unloadingFinishedAt:  string | null;
  decidedAt:            string | null;
  comment:              string | null;
  createdAt:            string;
  updatedAt:            string;
}

export interface CreateVehicleRequest {
  batchId:        string;
  licensePlate:   string;
  driverName?:    string;
  culture:        CultureType;
  declaredVolume: number;
  arrivedAt?:     string;
  comment?:       string;
}

export interface VehicleFilterParams {
  batchId?:      string;
  status?:       VehicleStatus;
  culture?:      CultureType;
  licensePlate?: string;
  page?:         number;
  size?:         number;
  sort?:         string;
}


export async function getVehicles(params?: VehicleFilterParams): Promise<SpringPage<VehicleResponse>> {
  const res = await api.get<{ data: SpringPage<VehicleResponse> }>("/vehicles", { params });
  return res.data.data;
}

export async function createVehicle(data: CreateVehicleRequest): Promise<VehicleResponse> {
  const res = await api.post<{ data: VehicleResponse }>("/vehicles", data);
  return res.data.data;
}

export async function startProcessing(id: string): Promise<VehicleResponse> {
  const res = await api.patch<{ data: VehicleResponse }>(`/vehicles/${id}/start-processing`);
  return res.data.data;
}

export async function acceptVehicle(id: string): Promise<VehicleResponse> {
  const res = await api.patch<{ data: VehicleResponse }>(`/vehicles/${id}/accept`);
  return res.data.data;
}

export async function rejectVehicle(id: string, comment?: string): Promise<VehicleResponse> {
  const res = await api.patch<{ data: VehicleResponse }>(`/vehicles/${id}/reject`, null, { params: { comment } });
  return res.data.data;
}
