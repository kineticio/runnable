import type { LoaderFunction } from '@remix-run/node';
import { WorkflowTypeId } from '@runnablejs/api';
import invariant from 'tiny-invariant';
import { authenticator } from '../models/auth.server';
import { internalRedirect } from '../utils/internalRedirect';
import { getUrl } from '../utils/routes';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
  invariant(params.actionId, 'actionId not found');
  const response = await context.client.startWorkflow(params.actionId as WorkflowTypeId, {
    user,
  });

  return internalRedirect(`/actions/${params.actionId}/workflows/${response.workflowId}`);
};
