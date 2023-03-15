import type { LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { authenticator } from '../models/auth.server';
import { internalRedirect } from '../utils/internalRedirect';
import { getUrl } from '../utils/routes';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  // TODO: Use user
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
  invariant(params.actionId, 'actionId not found');
  const response = await context.client.startWorkflow(params.actionId);

  return internalRedirect(`/actions/${params.actionId}/workflows/${response.workflowId}`);
};
