import { useRef, useEffect, useCallback, useState } from "react";
import { RecoveryConfig, RecoveryPopupMessage, validateUserOperationCallData } from "./types";
import { RECOVERY_DASHBOARD_URL } from "../constants";

const useKernelAccountRecovery = ({ address, onSetupGuardianRequest }: RecoveryConfig) => {
  const childWindowRef = useRef<Window | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const openRecoveryPopup = useCallback(() => {
    if (address === undefined) {
      return;
    }
    const parentUrl = encodeURIComponent(window.location.origin);
    const dashboardUrl = `${RECOVERY_DASHBOARD_URL}/recovery-setup/${address}?parentUrl=${parentUrl}`;
    const windowFeatures = 'width=450,height=650,resizable,scrollbars=yes,status=1';
    childWindowRef.current = window.open(dashboardUrl, '_blank', windowFeatures);

    if (childWindowRef.current) {
      childWindowRef.current.focus();
    }
  }, [address]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== RECOVERY_DASHBOARD_URL) {
        // Ignore messages from other origins
        return;
      }
      if (error) {
        setError(undefined);
      }

      const { userOp } = event.data;
      const parseUserOpCallData = validateUserOperationCallData(userOp);

      if (!parseUserOpCallData.success) {
        setError('Invalid user operation call data');
        return;
      }

      childWindowRef.current?.postMessage({
        type: 'tx-submitted',
        status: 'processing'
      } as RecoveryPopupMessage, RECOVERY_DASHBOARD_URL);

      if (onSetupGuardianRequest) {
        await onSetupGuardianRequest(parseUserOpCallData.data);
      }

      childWindowRef.current?.postMessage({
        type: 'tx-submitted',
        status: 'done'
      } as RecoveryPopupMessage, RECOVERY_DASHBOARD_URL);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSetupGuardianRequest]);

  return { 
    openRecoveryPopup,
    error
  };
};

export default useKernelAccountRecovery;