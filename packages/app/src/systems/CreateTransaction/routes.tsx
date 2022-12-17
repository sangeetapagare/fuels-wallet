import { Route } from 'react-router-dom';

import { Pages } from '../Core/types';

import { CreateTransfer, ApproveTransfer } from './pages';

export const createTransactionRoutes = (
  <>
    <Route path={Pages.send()} element={<CreateTransfer />} />
    <Route path={Pages.sendConfirm()} element={<ApproveTransfer />} />
  </>
);
