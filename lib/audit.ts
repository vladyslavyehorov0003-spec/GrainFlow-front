import { api } from "./api";
import { SpringPage } from "./workers";

export type AuditType="SILO"|"LAB_ANALYSIS"|"VEHICLE"|"BATCH";

export interface AuditFilterParams {
  
  entityType?:AuditType;
  entityId?:string
  page?: number;
  size?: number;
  sort?: string;
};
export const AUDIT_LABLE:Record<AuditType,string>={
    SILO:"Silo",
    "BATCH":"Batches",
    "LAB_ANALYSIS": "Lab analysis",
    "VEHICLE": "Vehicle"
}
export interface AuditResponce {
  id:         string;
  userId:     string;
  companyId:  string;
  action:     string;
  entityType: AuditType;
  entityId:   string;
  changes:    string | null;
  createdAt:  string;
}
export async function getAudit(params:AuditFilterParams): Promise<SpringPage<AuditResponce>> {
    const resp=await api.get<{data:SpringPage<AuditResponce>}>("/audit",{params})
    return resp.data.data
}