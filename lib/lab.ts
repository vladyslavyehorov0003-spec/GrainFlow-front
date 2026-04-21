import { api } from "./api";
import { SpringPage } from "./workers";

export type LabStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "ANALYSIS_DONE"
  | "DRYING"
  | "DRYING_DONE"
  | "STORED"
  | "CANCELED";

export const LAB_STATUS_LABEL: Record<LabStatus, string> = {
  PENDING:       "Pending",
  IN_PROGRESS:   "In Progress",
  ANALYSIS_DONE: "Analysis Done",
  DRYING:        "Drying",
  DRYING_DONE:   "Drying Done",
  STORED:        "Stored",
  CANCELED:      "Canceled",
};

export interface LabAnalysisResponse {
  id:                   string;
  companyId:            string;
  vehicleId:            string;
  status:               LabStatus;

  analysisStartedAt:    string | null;
  analysisFinishedAt:   string | null;

  moisture:             number | null;
  impurity:             number | null;
  protein:              number | null;

  dryingStartedAt:      string | null;
  dryingFinishedAt:     string | null;
  estimatedDryingEndAt: string | null;
  volumeBeforeDrying:   number | null;
  volumeAfterDrying:    number | null;
  moistureAfterDrying:  number | null;

  actualVolume:         number | null;
  decidedAt:            string | null;

  approvalStatus:       "PENDING" | "APPROVED" | "REJECTED";
  
  siloId:               string | null;
  storedAt:             string | null;

  

  comment:              string | null;
  createdAt:            string;
  updatedAt:            string;
}

export interface LabFilterParams {
  status?: LabStatus;
  vehicleId?: string;
  batchId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface StartDryingRequest {
  volumeBeforeDrying: number;
  estimatedDryingEndAt?: string;
}

export interface FinishDryingRequest {
  volumeAfterDrying: number;
  moistureAfterDrying: number;
}

export interface FinishAnalysisRequest {
  moisture: number;
  impurity: number;
  protein?: number;
  actualVolume: number;
  comment?: string;
}

export interface ReleaseLabRequest {
  isApproved: boolean;
  comment?: string;
}

export async function getLabAnalyses(params?: LabFilterParams): Promise<SpringPage<LabAnalysisResponse>> {
  const res = await api.get<{ data: SpringPage<LabAnalysisResponse> }>("/api/v1/lab-analyses", { params });
  return res.data.data;
}

export async function startAnalysis(id: string): Promise<LabAnalysisResponse> {
  const res = await api.patch<{ data: LabAnalysisResponse }>(`/api/v1/lab-analyses/${id}/start`);
  return res.data.data;
}

export async function startDrying(id: string, data: StartDryingRequest): Promise<LabAnalysisResponse> {
  const res = await api.patch<{ data: LabAnalysisResponse }>(`/api/v1/lab-analyses/${id}/start-drying`, data);
  return res.data.data;
}

export async function finishDrying(id: string, data: FinishDryingRequest): Promise<LabAnalysisResponse> {
  const res = await api.patch<{ data: LabAnalysisResponse }>(`/api/v1/lab-analyses/${id}/finish-drying`, data);
  return res.data.data;
}

export async function finishAnalysis(id: string, data: FinishAnalysisRequest): Promise<LabAnalysisResponse> {
  const res = await api.patch<{ data: LabAnalysisResponse }>(`/api/v1/lab-analyses/${id}/finish-analysis`, data);
  return res.data.data;
}

export async function releaseLab(id: string, data: ReleaseLabRequest): Promise<LabAnalysisResponse> {
  const res = await api.patch<{ data: LabAnalysisResponse }>(`/api/v1/lab-analyses/${id}/release`, data);
  return res.data.data;
}
