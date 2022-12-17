import { useInterpret, useSelector } from '@xstate/react';
import type { BN } from 'fuels';
import { useNavigate } from 'react-router-dom';

import type { SendMachineState } from '../machines/sendMachine';
import { SendScreens, sendMachine } from '../machines/sendMachine';

import { useAccounts } from '~/systems/Account';
import type { AssetSelectInput } from '~/systems/Asset';
import { Pages } from '~/systems/Core';
import { getFilteredErrors, getGroupedErrors } from '~/systems/Transaction';

function filterGeneralErrors(state: SendMachineState, prop: string) {
  if (!state.context.errors) return {};
  const all = getGroupedErrors(state.context.errors?.[prop]);
  const general = getFilteredErrors(all, ['InsufficientInputAmount']);
  const hasGeneral = Boolean(Object.keys(general || {}).length);
  return { all, general, hasGeneral };
}

const selectors = {
  inputs(state: SendMachineState) {
    return state.context.inputs;
  },
  response(state: SendMachineState) {
    return state.context.response;
  },
  screen(state: SendMachineState) {
    if (state.matches('confirming.unlocking')) return SendScreens.unlocking;
    if (state.matches('confirming.idle')) return SendScreens.confirm;
    return SendScreens.select;
  },
  isLoading(state: SendMachineState) {
    return (
      state.matches('fetchingFakeTx') ||
      state.matches('confirming.creatingTx') ||
      state.matches('confirming.sendingTx') ||
      state.children.unlock?.state.matches('unlocking')
    );
  },
  canConfirm(state: SendMachineState) {
    const { address, amount, asset } = state.context.inputs || {};
    const errors = state.context.errors || {};
    const hasErrors = Object.values(errors).some(Boolean);
    const isFilled = Boolean(asset && address && amount);
    return !hasErrors && isFilled;
  },
  errors(state: SendMachineState) {
    return {
      unlock: state.context.errors?.unlockError,
      isAddressInvalid: state.context.errors?.isAddressInvalid,
      txRequest: filterGeneralErrors(state, 'txRequestErrors'),
      txApprove: filterGeneralErrors(state, 'txApproveErrors'),
    };
  },
  showTxDetails(state: SendMachineState) {
    const { response, inputs } = state.context;
    const { amount } = inputs || {};
    return response?.fee?.gt(0) || amount?.gt(0);
  },
};

export function useSend() {
  const navigate = useNavigate();
  const { account } = useAccounts();
  const service = useInterpret(() =>
    sendMachine.withConfig({
      actions: {
        goToHome() {
          reset();
          navigate(Pages.index());
        },
      },
    })
  );

  const inputs = useSelector(service, selectors.inputs);
  const response = useSelector(service, selectors.response);
  const canConfirm = useSelector(service, selectors.canConfirm);
  const screen = useSelector(service, selectors.screen);
  const isLoading = useSelector(service, selectors.isLoading);
  const errors = useSelector(service, selectors.errors);
  const showTxDetails = useSelector(service, selectors.showTxDetails);

  function reset() {
    service.send('RESET');
  }
  function cancel() {
    service.send('BACK');
  }
  function confirm() {
    service.send('CONFIRM');
  }

  function setAsset(asset?: AssetSelectInput | null) {
    service.send('SET_ASSET', { input: asset });
  }
  function setAddress(address: string) {
    service.send('SET_ADDRESS', { input: address });
  }
  function setAmount(amount: BN) {
    service.send('SET_AMOUNT', { input: amount });
  }
  function unlock(password: string) {
    service.send('UNLOCK_WALLET', { input: { password, account } });
  }

  return {
    inputs,
    response,
    errors,
    screen,
    canConfirm,
    showTxDetails,
    isLoading,
    handlers: {
      cancel,
      confirm,
      setAsset,
      setAddress,
      setAmount,
      unlock,
    },
  };
}

export type UseSendReturn = ReturnType<typeof useSend>;
