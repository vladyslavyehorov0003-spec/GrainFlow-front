import { Badge } from "@/components/ui/badge";
import { BatchStatus, STATUS_LABEL as BATCH_LABEL, STATUS_VARIANT as BATCH_VARIANT } from "@/lib/batch";
import { VehicleStatus, STATUS_LABEL as VEHICLE_LABEL, STATUS_VARIANT as VEHICLE_VARIANT } from "@/lib/vehicle";
import { LabStatus, LAB_STATUS_LABEL, LAB_STATUS_VARIANT } from "@/lib/lab";

type Props = { className?: string };

export function BatchStatusBadge({ status, className }: Props & { status: BatchStatus }) {
  return <Badge variant={BATCH_VARIANT[status]} className={className}>{BATCH_LABEL[status]}</Badge>;
}

export function VehicleStatusBadge({ status, className }: Props & { status: VehicleStatus }) {
  return <Badge variant={VEHICLE_VARIANT[status]} className={className}>{VEHICLE_LABEL[status]}</Badge>;
}

export function LabStatusBadge({ status, className }: Props & { status: LabStatus }) {
  return <Badge variant={LAB_STATUS_VARIANT[status]} className={className}>{LAB_STATUS_LABEL[status]}</Badge>;
}
