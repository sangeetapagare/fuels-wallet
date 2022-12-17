import { Button } from '@fuel-ui/react';
import { useNavigate } from 'react-router-dom';

import { CreateTransferForm } from '../../components';
import type { CreateTransaferFormValues } from '../../hooks';
import { useCreateTransaferForm } from '../../hooks';

import { Layout, Pages } from '~/systems/Core';
import { useTransactionRequest } from '~/systems/DApp';

export function CreateTransfer() {
  const navigate = useNavigate();
  const tx = useTransactionRequest({
    isOriginRequired: false,
  });
  const form = useCreateTransaferForm();

  async function handleSubmit(data: CreateTransaferFormValues) {
    navigate(Pages.sendConfirm(), {
      state: {
        to: data.to,
        amount: data.amount.toHex(),
        assetId: data.asset!.assetId,
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Layout title="Send" isLoading={tx.isLoading}>
        <Layout.TopBar onBack={() => navigate(Pages.wallet())} />
        <Layout.Content>
          <CreateTransferForm form={form} />
        </Layout.Content>
        <Layout.BottomBar>
          <Button
            color="gray"
            variant="ghost"
            onPress={() => navigate(Pages.wallet())}
          >
            Back
          </Button>
          <Button type="submit" color="accent" isLoading={tx.isLoading}>
            Confirm
          </Button>
        </Layout.BottomBar>
      </Layout>
    </form>
  );
}
