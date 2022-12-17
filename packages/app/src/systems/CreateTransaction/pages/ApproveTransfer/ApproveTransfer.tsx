import { WalletLocked } from 'fuels';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { TransactionRequestPage, useTransactionRequest } from '~/systems/DApp';
import { NetworkScreen, useNetworks } from '~/systems/Network';
import { TxService } from '~/systems/Transaction/services';

export function ApproveTransfer() {
  const { selectedNetwork } = useNetworks({
    type: NetworkScreen.list,
  });
  const tx = useTransactionRequest({
    isOriginRequired: false,
  });
  const { state } = useLocation();

  useEffect(() => {
    async function init() {
      if (!selectedNetwork || !tx.account || tx.approvedTx) {
        return;
      }
      const request = TxService.createTransfer(state);
      const providerUrl = selectedNetwork!.url;
      const wallet = new WalletLocked(tx.account!.address, providerUrl);
      const requestFunded = await TxService.fundTransaction(wallet, request);
      tx.handlers.request({
        tx: requestFunded.request,
        providerUrl,
        origin: '',
      });
    }
    init();
  }, [state, selectedNetwork, tx]);

  return (
    <TransactionRequestPage txRequest={tx} selectedNetwork={selectedNetwork} />
  );
}
