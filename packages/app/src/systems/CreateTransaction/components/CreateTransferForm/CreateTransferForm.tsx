import { cssObj } from '@fuel-ui/css';
import { Box, Flex, Input, InputAmount, Stack, Text } from '@fuel-ui/react';
import { bn } from 'fuels';

import type { UseCreateTransaferFormReturn } from '../../hooks';

import { useAccounts } from '~/systems/Account';
import { AssetSelect } from '~/systems/Asset';
import { ControlledField } from '~/systems/Core';

type SendSelectProps = {
  form: UseCreateTransaferFormReturn;
};

export function CreateTransferForm({ form }: SendSelectProps) {
  const { account } = useAccounts();
  const { control, formState } = form;
  return (
    <Stack gap="$4">
      {/* {send.errors.txRequest.hasGeneral && (
        <TxErrors errors={send.errors.txRequest.general} />
      )} */}
      <Flex css={styles.row}>
        <Text as="span" css={styles.title}>
          Send
        </Text>
        <ControlledField
          control={control}
          name="asset"
          isRequired
          isInvalid={Boolean(formState.errors?.asset)}
          render={({ field }) => (
            <AssetSelect
              selected={field.value || ''}
              onSelect={field.onChange}
              items={account?.balances}
            />
          )}
        />
      </Flex>
      <Flex css={styles.row}>
        <Text as="span" css={styles.title}>
          To
        </Text>
        <Box css={styles.addressRow}>
          <ControlledField
            control={control}
            name="to"
            isRequired
            isInvalid={Boolean(formState.errors?.to)}
            render={({ field }) => (
              <Input size="sm">
                <Input.Field
                  aria-label="Address Input"
                  id="address"
                  name="address"
                  placeholder="Write a fuel address"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </Input>
            )}
          />
        </Box>
      </Flex>
      <Stack gap="$3">
        <Text as="span" css={{ ...styles.title, ...styles.amountTitle }}>
          Which amount?
        </Text>
        <ControlledField
          control={control}
          name="amount"
          isRequired
          isInvalid={Boolean(formState.errors?.to)}
          render={({ field }) => (
            <InputAmount
              value={field.value || ''}
              onChange={field.onChange}
              balance={bn(account?.balance)}
            />
          )}
        />
      </Stack>
      {/* {send.showTxDetails && (
        <TxDetails fee={send.response?.fee} amountSent={send.inputs?.amount} />
      )} */}
    </Stack>
  );
}

const styles = {
  row: cssObj({
    alignItems: 'flex-start',
    gap: '$4',

    '.fuel_asset-select': {
      flex: 1,
    },
    '.fuel_input > input': {
      px: '$3',
      fontFamily: '$sans',
      fontWeight: '$medium',
    },
  }),
  title: cssObj({
    pt: '$2',
    color: '$gray12',
    fontSize: '$xl',
    fontWeight: '$semibold',
  }),
  amountTitle: cssObj({
    fontSize: '$md',
  }),
  addressRow: cssObj({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',

    '.error-msg': {
      fontSize: '$xs',
      color: '$red9',
    },
  }),
};
