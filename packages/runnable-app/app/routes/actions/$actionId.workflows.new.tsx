import type { LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { defaultContext } from '../../models/context';
import { WORKFLOW_MANAGER } from '../../models/workflows/workflow-manager.server';
import { requireUser } from '../../session.server';
import { internalRedirect } from '../../utils/routes';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  context = defaultContext(context);
  const user = await requireUser(request, context);
  invariant(params.actionId, 'actionId not found');
  const action = context.actions[params.actionId];
  const response = await WORKFLOW_MANAGER.startWorkflow(action, {
    user,
    logger: context.logger || console,
  });

  return internalRedirect(`/actions/${params.actionId}/workflows/${response.workflowId}`);
};
