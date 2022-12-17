/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInterpret, useSelector } from '@xstate/react';
import { useNavigate } from 'react-router-dom';

import type { TransactionMachineState } from '../machines/transactionMachine';
import { transactionMachine } from '../machines/transactionMachine';
import { useTransactionRequestMethods } from '../methods/transactionRequestMethods';

import { useAccounts } from '~/systems/Account';
import { Pages } from '~/systems/Core';
import { getFilteredErrors, useTxOutputs } from '~/systems/Transaction';
import type { TxInputs } from '~/systems/Transaction/services';

const selectors = {
  hasTransaction(state: TransactionMachineState) {
    return !!state.context.tx;
  },
  isUnlocking(state: TransactionMachineState) {
    return state.matches('unlocking');
  },
  waitingApproval(state: TransactionMachineState) {
    return state.matches('waitingApproval');
  },
  sendingTx(state: TransactionMachineState) {
    return state.matches('sendingTx');
  },
  isUnlockingLoading(state: TransactionMachineState) {
    return state.children.unlock?.state.matches('unlocking');
  },
  context(state: TransactionMachineState) {
    return state.context;
  },
  generalErrors(state: TransactionMachineState) {
    const groupedErrors = state.context.txDryRunGroupedErrors;
    return getFilteredErrors(groupedErrors, ['InsufficientInputAmount']);
  },
  isShowingInfo({
    isLoading,
    account,
  }: Omit<
    ReturnType<typeof useAccounts>,
    'handlers' | 'accounts' | 'hasBalance'
  >) {
    return (state: TransactionMachineState) => {
      return Boolean(
        !isLoading &&
          !state.context.approvedTx &&
          !state.context.txApproveError &&
          (state.context.origin || !state.context.isOriginRequired) &&
          account
      );
    };
  },
};

type UseTransactionRequestOpts = {
  isOriginRequired?: boolean;
};

export function useTransactionRequest(opts: UseTransactionRequestOpts = {}) {
  const { account, isLoading } = useAccounts();
  const navigate = useNavigate();
  const service = useInterpret(() => {
    return transactionMachine
      .withContext({
        isOriginRequired: !!opts.isOriginRequired,
      })
      .withConfig({
        actions: {
          navigateToHome: () => {
            navigate(Pages.wallet());
          },
        },
      } as any);
  });
  const { send } = service;
  const ctx = useSelector(service, selectors.context);
  const isUnlocking = useSelector(service, selectors.isUnlocking);
  const isUnlockingLoading = useSelector(service, selectors.isUnlockingLoading);
  const waitingApproval = useSelector(service, selectors.waitingApproval);
  const sendingTx = useSelector(service, selectors.sendingTx);
  const generalErrors = useSelector(service, selectors.generalErrors);
  const hasTransaction = useSelector(service, selectors.hasTransaction);
  const groupedErrors = ctx.txDryRunGroupedErrors;
  const hasGeneralErrors = Boolean(Object.keys(generalErrors || {}).length);
  const isShowingSelector = selectors.isShowingInfo({
    isLoading,
    account,
  });
  const isShowingInfo = useSelector(service, isShowingSelector);
  const { coinOutputs, outputsToSend, outputAmount } = useTxOutputs(ctx.tx);

  function approve() {
    send('APPROVE');
  }
  function reject() {
    send('REJECT');
  }
  function unlock(password: string) {
    send('UNLOCK_WALLET', { input: { password, account } });
  }
  function closeUnlock() {
    send('CLOSE_UNLOCK');
  }
  function request(input: TxInputs['request']) {
    send('START_REQUEST', { input });
  }

  useTransactionRequestMethods(service);

  return {
    handlers: {
      request,
      approve,
      unlock,
      closeUnlock,
      reject,
    },
    account,
    isLoading,
    isUnlocking,
    isUnlockingLoading,
    sendingTx,
    waitingApproval,
    isShowingInfo,
    coinOutputs,
    outputsToSend,
    outputAmount,
    groupedErrors,
    generalErrors,
    hasGeneralErrors,
    hasTransaction,
    ...ctx,
  };
}
