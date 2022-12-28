import { Stack } from '@fuel-ui/react';
import { Address } from 'fuels';
import { useNavigate } from 'react-router-dom';

import { ActivityList } from '../../components/ActivityList/ActivityList';
import { useTxs } from '../../hooks/useTxs';

import { useAccounts } from '~/systems/Account';
import { Layout } from '~/systems/Core';
import { NetworkScreen, useNetworks } from '~/systems/Network';

export function ViewActivity() {
  const navigate = useNavigate();
  const networks = useNetworks({ type: NetworkScreen.list });
  const providerUrl = networks?.selectedNetwork?.url;
  const { account, isLoading } = useAccounts();
  const address = account ? Address.fromString(account.address).toB256() : '';

  const { isLoadingTx, txs } = useTxs({ address, providerUrl });

  return (
    <Layout title="Activity" isLoading={isLoading}>
      <Layout.TopBar onBack={() => navigate(-1)} />
      <Layout.Content>
        <Stack gap="$4">
          <ActivityList
            transactions={txs ?? []}
            isLoading={isLoadingTx || isLoading || !account}
          />
        </Stack>
      </Layout.Content>
    </Layout>
  );
}
