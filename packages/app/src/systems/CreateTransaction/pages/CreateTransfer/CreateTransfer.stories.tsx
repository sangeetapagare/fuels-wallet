import { CreateTransfer } from './CreateTransfer';

import { createMockAccount } from '~/systems/Account';
import { NetworkService } from '~/systems/Network';

export default {
  component: CreateTransfer,
  title: 'Send/Pages/Send',
  viewport: {
    defaultViewport: 'chromeExtension',
  },
  loaders: [
    async () => {
      await createMockAccount();
      await NetworkService.clearNetworks();
      await NetworkService.addFirstNetwork();
      return {};
    },
  ],
};

export const Usage = () => <CreateTransfer />;
Usage.parameters = {
  layout: 'fullscreen',
};
