import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { parseNamespacedWorkflowId, WorkflowType } from '@runnablejs/api';
import { Page } from '../components/layout/Page';

import { getUrl } from '../utils/routes';
import { internalRedirect } from '../utils/internalRedirect';


export const meta: MetaFunction<LoaderData> = ({ data }) => {
  if (!data?.action) return { title: 'Runnable' };

  return {
    title: `${data.action.title} | Runnable`,
  };
};

export async function loader({ params, context }: LoaderArgs) {
  invariant(params.actionId, 'actionId not found');
  const [namespace, actionId] = parseNamespacedWorkflowId(params.actionId);
  const actions = await context.client.listWorkflowTypes(namespace);
  const action = actions.workflows.find((action) => action.id === params.actionId);

  if (!action) {
    console.error(`Cannot find action ${actionId} in namespace ${namespace}`);
    console.error(`Available actions: ${actions.workflows.map((action) => action.id).join(', ')}`);
    throw internalRedirect(`/`);
  }

  return json({ actionId, namespace, action });
}

export default function ActionDetailsPage() {
  const { namespace, action, actionId } = useLoaderData<typeof loader>();

  if (!action) return <div>Cannot find action {actionId}</div>;

  return (
    <Page title={['Actions', action.title]} animationKey={useLocation().pathname}>
      <VStack spacing={6} alignItems="flex-start">
        <Heading as="h2" size="xl">
          {action.title}
        </Heading>
        <Text>{action.description}</Text>
        <Button
          size="md"
          height="48px"
          width="200px"
          variant="ghost"
          border="2px"
          borderColor="teal.500"
          as={Link}
          colorScheme="teal"
          to={getUrl(`/actions/${namespace}.${actionId}/workflows/new`)}
        >
          New
        </Button>
      </VStack>
      <Outlet />
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
