import type { Asset } from '@fuel-wallet/types';
import { yupResolver } from '@hookform/resolvers/yup';
import type { BN } from 'fuels';
import { bn } from 'fuels';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import type { Maybe } from '~/systems/Core';

export type CreateTransaferFormValues = {
  asset: Asset | null;
  to: string | null;
  amount: BN;
};

const schema = yup
  .object({
    asset: yup.object().required('Asset is required'),
    amount: yup.object().required('Amount is required'),
    to: yup.string().required('Address is required'),
  })
  .required();

const DEFAULT_VALUES: CreateTransaferFormValues = {
  asset: null,
  to: null,
  amount: bn(0),
};

export type UseCreateTransaferFormReturn = ReturnType<
  typeof useCreateTransaferForm
>;

export type UseCreateTransaferFormOpts = {
  defaultValues?: Maybe<CreateTransaferFormValues>;
};

export function useCreateTransaferForm(opts: UseCreateTransaferFormOpts = {}) {
  const form = useForm<CreateTransaferFormValues>({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: opts.defaultValues || DEFAULT_VALUES,
  });
  return form;
}
