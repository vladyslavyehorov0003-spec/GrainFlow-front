import { useCallback, useEffect, useState } from "react";
import { AuditFilterParams, AuditResponce, getAudit } from "../audit";
import { SpringPage } from "../workers";

export function useAudit(params?:AuditFilterParams){
    const [data, setData] = useState<SpringPage<AuditResponce>>({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 0 })
    const [isLoading, setIsLoading] = useState(true);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const {entityType,entityId,page,size,sort}=params??{}

    useEffect(() => {
      let cancelled = false;
      
          getAudit({ entityType,entityId, page, size, sort })
            .then((p) => { if (!cancelled) { setData(p); setIsLoading(false); } })
            .catch(() => { if (!cancelled) setIsLoading(false); });
      
          return () => { cancelled = true; };
    }, [entityType,entityId,page,size,sort,refetchTrigger])

    const refetch=useCallback(()=>{
        setIsLoading(true);
        setRefetchTrigger((t) => t + 1);
    },[])

    return{data,isLoading,refetch}
    

}