import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import useSWR from 'swr';

import { RecoveryConfig, RecoveryPopupMessage, validateUserOperationCallData } from "./types";
import { KERNEL_API_URL, RECOVERY_DASHBOARD_URL } from "../constants";
import { isAddress } from "../utils/isAddress";

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

  /**
   * Returns true if the process to add or remove a guardian has been initiated but not yet confirmed
   */
  isPending: boolean;
};

const useKernelAccountRecovery = ({
  address,
  onSetupGuardianRequest,
  chainId,
  suggestedGuardianAddress
}: RecoveryConfig): UseKernelAccountRecoveryResult => {
  const childWindowRef = useRef<Window | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [popupCheckInterval, setPopupCheckInterval] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<'enableRecovery' | 'deleteRecovery' | undefined>(undefined);

  const { data } = useSWR(
    address ? `${KERNEL_API_URL}/accounts/${address}/guardians` : null, 
    fetcher,
    { refreshInterval: 3000 }
  );

  const guardians = useMemo(() => {
    if (!data) {
      return [];
    }

    if (data.length > 0 && requestType === 'enableRecovery') {
      setIsPending(false);
      setRequestType(undefined);
    }
    if (data.length === 0 && requestType === 'deleteRecovery') {
      setIsPending(false);
      setRequestType(undefined);
    }

    return data.map((guardian: any) => guardian.guardian);
  }, [data]);

  const checkPopupWindow = useCallback(() => {
    if (childWindowRef.current && childWindowRef.current.closed) {
      setIsPending(false);
    }
  }, []);

  const openRecoveryPopup = useCallback(() => {
    if (address === undefined || chainId === undefined) {
      return;
    }
    setIsPending(true);
    const parentUrl = encodeURIComponent(window.location.origin);
    let dashboardUrl = `${RECOVERY_DASHBOARD_URL}/recovery-setup/${address}?parentUrl=${parentUrl}&chainId=${chainId}`;
    if (suggestedGuardianAddress && isAddress(suggestedGuardianAddress)) {
      dashboardUrl = dashboardUrl.concat(`&suggestedGuardianAddress=${suggestedGuardianAddress}`);
    }
    const windowFeatures = 'width=400,height=560,resizable,scrollbars=yes,status=1';
    childWindowRef.current = window.open(dashboardUrl, '_blank', windowFeatures);

    if (childWindowRef.current) {
      childWindowRef.current.focus();
      if (!popupCheckInterval) {
        const interval = setInterval(checkPopupWindow, 1000); // Check every second
        setPopupCheckInterval(interval);
      }
    }
  }, [address, checkPopupWindow, popupCheckInterval, chainId]);

  useEffect(() => {
    if (popupCheckInterval && !isPending) {
      clearInterval(popupCheckInterval);
      setPopupCheckInterval(null);
    }
  }, [popupCheckInterval, isPending]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== RECOVERY_DASHBOARD_URL) {
        // Ignore messages from other origins
        return;
      }
      if (error) {
        // Reset the error if there was one
        setError(undefined);
      }

      const { userOp, request } = event.data;
      setRequestType(request);
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
      if (popupCheckInterval) {
        clearInterval(popupCheckInterval);
      }
    };
  }, [onSetupGuardianRequest, popupCheckInterval]);

  return { 
    openRecoveryPopup,
    error,
    recoveryEnabled: guardians.length > 0,
    guardians,
    isPending
  };
};

export default useKernelAccountRecovery;