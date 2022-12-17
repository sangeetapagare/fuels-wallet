import { cssObj } from '@fuel-ui/css';
import { Button, Flex, Heading, Link, Stack, Text } from '@fuel-ui/react';
import { getBlockExplorerLink } from '@fuel-wallet/sdk';
import type { Network } from '@fuel-wallet/types';
import { AddressType } from '@fuel-wallet/types';
import { useNavigate } from 'react-router-dom';

import { ConnectInfo, UnlockDialog } from '../../components';
import { useTransactionRequest } from '../../hooks/useTransactionRequest';

import { AssetsAmount } from '~/systems/Asset';
import { Layout, Pages } from '~/systems/Core';
import { TopBarType } from '~/systems/Core/components/Layout/TopBar';
import { NetworkScreen, useNetworks } from '~/systems/Network';
import { TxDetails, TxErrors, TxFromTo } from '~/systems/Transaction';

export function TransactionRequestPage({
  txRequest,
  selectedNetwork,
}: {
  txRequest: ReturnType<typeof useTransactionRequest>;
  selectedNetwork: Network;
}) {
  const navigate = useNavigate();
  const { handlers, ...ctx } = txRequest;
  const content = (
    <Layout.Content css={styles.content}>
      {ctx.isShowingInfo && (
        <Stack gap="$4">
          {ctx.isOriginRequired && (
            <ConnectInfo
              origin={ctx.origin!}
              account={ctx.account!}
              isReadOnly={true}
            />
          )}
          {ctx.account && (
            <TxFromTo
              from={{
                type: AddressType.account,
                address: ctx.account.publicKey,
              }}
              to={{
                type: AddressType.account,
                address: ctx.outputsToSend[0]?.to.toString(),
              }}
            />
          )}
          {ctx.hasGeneralErrors && <TxErrors errors={ctx.generalErrors} />}
          <AssetsAmount
            amounts={ctx.outputsToSend}
            balanceErrors={ctx.groupedErrors?.InsufficientInputAmount}
            title="Assets to Send"
          />
          <TxDetails fee={ctx.fee} amountSent={ctx.outputAmount} />
        </Stack>
      )}
      {ctx.approvedTx && (
        <Stack>
          <Heading as="h4">Transaction sent</Heading>
          <Text>
            Transaction sent successfully.
            <Link
              isExternal
              href={getBlockExplorerLink({
                path: `/transaction/${ctx.approvedTx.id}`,
                providerUrl: selectedNetwork?.url,
              })}
            >
              Click here to view on Fuel Explorer
            </Link>
          </Text>
        </Stack>
      )}
      {ctx.txApproveError && (
        <Stack>
          <Heading as="h4">Transaction failed</Heading>
          <Text>
            Transaction failed to run. Please try again or contact support if
            the problem persists.
          </Text>
        </Stack>
      )}
    </Layout.Content>
  );

  const footer = (
    <Layout.BottomBar>
      <Flex>
        {!ctx.approvedTx && (
          <Button
            onPress={handlers.reject}
            color="gray"
            variant="ghost"
            css={{ flex: 1 }}
          >
            Reject
          </Button>
        )}
        {ctx.approvedTx && (
          <Button
            onPress={() => navigate(Pages.wallet())}
            color="gray"
            variant="ghost"
            css={{ flex: 1 }}
          >
            Go to wallet
          </Button>
        )}
        {!ctx.approvedTx && !ctx.txApproveError && (
          <Button
            color="accent"
            onPress={handlers.approve}
            isLoading={ctx.isLoading || ctx.sendingTx}
            isDisabled={!ctx.waitingApproval}
            css={{ flex: 1, ml: '$2' }}
          >
            Confirm
          </Button>
        )}
      </Flex>
    </Layout.BottomBar>
  );

  return (
    <>
      <Layout title="Approve Transaction" isLoading={ctx.isLoading}>
        <Layout.TopBar type={TopBarType.external} />
        {content}
        {footer}
      </Layout>
      <UnlockDialog
        unlockText="Confirm Transaction"
        unlockError={ctx.unlockError}
        isFullscreen={true}
        isOpen={ctx.isUnlocking}
        onUnlock={handlers.unlock}
        isLoading={ctx.isUnlockingLoading}
        onClose={handlers.closeUnlock}
      />
    </>
  );
}

export function TransactionRequest() {
  const { selectedNetwork } = useNetworks({ type: NetworkScreen.list });
  const txRequest = useTransactionRequest({
    isOriginRequired: true,
  });

  if (!txRequest.account) return null;

  return (
    <TransactionRequestPage
      selectedNetwork={selectedNetwork}
      txRequest={txRequest}
    />
  );
}

const styles = {
  content: cssObj({
    '& h2': {
      m: '$0',
      fontSize: '$sm',
      color: '$gray12',
    },
    '& h4': {
      m: '$0',
    },
  }),
  approveUrlTag: cssObj({
    alignSelf: 'center',
    background: 'transparent',
    borderColor: '$gray8',
    borderStyle: 'dashed',
  }),
};
