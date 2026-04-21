import { api } from "./api";
import { SpringPage } from "./workers";

export type BatchStatus = "PLANNED" | "ACTIVE" | "CLOSED";
export type CultureType = "WHEAT" | "BARLEY" | "CORN" | "SUNFLOWER" | "SOYBEAN" | "RYE" | "OATS";


export interface BatchResponse {
  id:             string;
  companyId:      string;
  contractNumber: string;
  culture:        CultureType;
  status:         BatchStatus;
  totalVolume:    number;
  acceptedVolume: number;
  unloadedVolume: number;
  loadingFrom:    string;
  loadingTo:      string;
  comment:        string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface BatchFilterParams {
  contractNumber?: string;
  culture?:        CultureType;
  status?:         BatchStatus;
  loadingFrom?:    string;
  loadingTo?:      string;
  page?:           number;
  size?:           number;
  sort?:           string;
}

export const CULTURE_LABEL: Record<CultureType, string> = {
  WHEAT:     "Wheat",
  BARLEY:    "Barley",
  CORN:      "Corn",
  SUNFLOWER: "Sunflower",
  SOYBEAN:   "Soybean",
  RYE:       "Rye",
  OATS:      "Oats",
};

export const STATUS_LABEL: Record<BatchStatus, string> = {
  PLANNED: "Planned",
  ACTIVE:  "Active",
  CLOSED:  "Closed",
};

export async function getBatches(params?: BatchFilterParams): Promise<SpringPage<BatchResponse>> {
  const res = await api.get<{ data: SpringPage<BatchResponse> }>("/api/v1/batches", { params });
  return res.data.data;
}

export interface CreateBatchRequest {
  contractNumber: string;
  culture:        CultureType;
  totalVolume:    number;
  loadingFrom:    string;
  loadingTo:      string;
  comment?:       string;
}

export async function getBatch(id: string): Promise<BatchResponse> {
  const res = await api.get<{ data: BatchResponse }>(`/api/v1/batches/${id}`);
  return res.data.data;
}

export async function createBatch(data: CreateBatchRequest): Promise<BatchResponse> {
  const res = await api.post<{ data: BatchResponse }>("/api/v1/batches", data);
  return res.data.data;
}
