import type { AppLoadContext, LoaderFunctionArgs } from 'react-router';
import { WorkflowTypeId } from '@runnablejs/api';
import invariant from 'tiny-invariant';
import { isAuthenticated } from '../models/auth.server';
import { internalRedirect } from '../utils/internalRedirect';
import { getUrl } from '../utils/routes';

export const loader = async ({ request, params, context }: LoaderFunctionArgs<AppLoadContext>) => {
  const user = await isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
  invariant(params.actionId, 'actionId not found');
  invariant(user, 'actionId not found');
  const response = await context.client.startWorkflow(params.actionId as WorkflowTypeId, {
    user,
  });

  return internalRedirect(`/actions/${params.actionId}/workflows/${response.workflowId}`);
};
