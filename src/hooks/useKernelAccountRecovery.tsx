import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import useSWR from 'swr';

import { RecoveryConfig, RecoveryPopupMessage, validateUserOperationCallData } from "./types";
import { KERNEL_API_URL, RECOVERY_DASHBOARD_URL } from "../constants";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

type UseKernelAccountRecoveryResult = {
  /**
   * Opens the recovery popup
   */
  openRecoveryPopup: () => void;

  /**
   * Error message
   */
  error?: string;

  /**
   * Whether the account has guardians
   */
  recoveryEnabled: boolean;

  /**
   * List of guardian addresses
   */
  guardians: string[];
};

const useKernelAccountRecovery = ({ address, onSetupGuardianRequest, chainId }: RecoveryConfig): UseKernelAccountRecoveryResult => {
  const childWindowRef = useRef<Window | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const { data } = useSWR(
    address ? `${KERNEL_API_URL}/accounts/${address}/guardians` : null, 
    fetcher,
    { refreshInterval: 3000 }
  );

  const guardians = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((guardian: any) => guardian.guardian);
  }, [data]);

  const openRecoveryPopup = useCallback(() => {
    if (address === undefined || chainId === undefined) {
      return;
    }
    const parentUrl = encodeURIComponent(window.location.origin);
    const dashboardUrl = `${RECOVERY_DASHBOARD_URL}/recovery-setup/${address}?parentUrl=${parentUrl}&chainId=${chainId}`;
    const windowFeatures = 'width=400,height=720,resizable,scrollbars=yes,status=1';
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
    error,
    recoveryEnabled: guardians.length > 0,
    guardians,
  };
};

export default useKernelAccountRecovery;