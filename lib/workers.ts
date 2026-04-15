import { api } from "./api";
import { UserResponse } from "./auth";

export interface CreateWorkerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pin: string;
}

export interface UpdateWorkerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  pin?: string;
  enabled?: boolean;
}

export interface WorkerFilterParams {
  search?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Shape of Spring's Page<T> response
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-based)
  size: number;
}

export async function getWorkers(params?: WorkerFilterParams): Promise<SpringPage<UserResponse>> {
  const res = await api.get<{ data: SpringPage<UserResponse> }>("/api/v1/users/workers", { params });
  return res.data.data;
}

export async function createWorker(data: CreateWorkerRequest): Promise<UserResponse> {
  const res = await api.post<{ data: UserResponse }>("/api/v1/users/workers", data);
  return res.data.data;
}

export async function updateWorker(workerId:string, data: UpdateWorkerRequest): Promise<UserResponse> {
  const res = await api.patch<{ data: UserResponse }>(`/api/v1/users/workers/${workerId}`, data);
  return res.data.data;
}

export async function deleteWorker(workerId: string): Promise<void> {
  await api.delete(`/api/v1/users/workers/${workerId}`);
}
