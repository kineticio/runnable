import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, SimpleGrid, VStack } from '@chakra-ui/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { FormView } from '../../components/forms/FormView';
import { Page } from '../../components/layout/Page';

import type { WorkflowId } from '../../models/ids';
import { WORKFLOW_MANAGER } from '../../models/workflows/workflow-manager.server';
import type { ActionResponse } from '../../types/response';
import { useCurrentUrl } from '../../utils/routes';

const ROOT = '__root__';

type LoaderData = ActionResponse;

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.workflowId, 'workflowId not found');
  const response = await WORKFLOW_MANAGER.pickUpWorkflow(params.workflowId as WorkflowId);

  return json<LoaderData>(response);
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.workflowId, 'workflowId not found');
  const formData = await request.formData();
  const data = formData.get(ROOT);

  const response = await WORKFLOW_MANAGER.continueWorkflow(params.workflowId as WorkflowId, { ioResponse: data });

  return json<LoaderData>(response);
};

export default function WorkflowDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const [search] = useSearchParams();
  const actionData = useActionData() as LoaderData;
  const location = useCurrentUrl();

  const currentView = actionData?.view ?? data.view;
  const hasNext = currentView.$type !== 'success' && currentView.$type !== 'error';
  const hasDebug = search.get('debug') === 'true';

  return (
    <Page title={`Workflow ${data.workflowId}`}>
      <SimpleGrid columns={2} spacing={10}>
        <Form method="post" reloadDocument action={location}>
          <VStack alignItems="flex-start" spacing={6}>
            <FormView name={ROOT} view={currentView} />
            {hasNext && (
              <Button colorScheme="teal" variant="solid" type="submit">
                Submit
              </Button>
            )}
          </VStack>
        </Form>
        {hasDebug && (
          <Alert status="info" flexDirection="column" alignSelf="flex-start">
            <AlertIcon />
            <AlertTitle>Debug</AlertTitle>
            <AlertDescription sx={{ whiteSpace: 'pre' }}>{JSON.stringify(data, null, 2)}</AlertDescription>
          </Alert>
        )}
      </SimpleGrid>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../../components/feedback/ErrorBoundary';
