import type { LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { defaultContext } from '../../models/context';
import { WORKFLOW_MANAGER } from '../../models/workflows/workflow-manager.server';
import { internalRedirect } from '../../utils/routes';

export const loader: LoaderFunction = async ({ params, context }) => {
  context = defaultContext(context);
  invariant(params.actionId, 'actionId not found');
  const action = context.actions[params.actionId];
  const response = await WORKFLOW_MANAGER.startWorkflow(action);

  return internalRedirect(`/actions/${params.actionId}/workflows/${response.workflowId}`);
};
