import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from '@chakra-ui/react';
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useLocation, useSearchParams, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { FormView } from '../../components/forms/FormView';
import { Page } from '../../components/layout/Page';
import { defaultContext } from '../../models/context';

import type { WorkflowId } from '../../models/ids';
import { WORKFLOW_MANAGER } from '../../models/workflows/workflow-manager.server';
import { Action } from '../../types';
import type { ActionResponse } from '../../types/response';

const ROOT = '__root__';

interface LoaderData extends ActionResponse {
  action: Action;
}

export const loader: LoaderFunction = async ({ params, context }) => {
  context = defaultContext(context);
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const response = await WORKFLOW_MANAGER.pickUpWorkflow(params.workflowId as WorkflowId);
  const action = context.actions[params.actionId];

  return json<LoaderData>({ action, ...response });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  context = defaultContext(context);
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const action = context.actions[params.actionId];

  const formData = await request.formData();

  let data: any;
  if (formData.has(ROOT)) {
    // single value
    data = formData.getAll(ROOT);
  } else {
    // nested values
    data = {};
    for (const [key, value] of formData.entries()) {
      data[key.replace(`${ROOT}.`, '')] = value;
    }
  }

  const response = await WORKFLOW_MANAGER.continueWorkflow(params.workflowId as WorkflowId, { ioResponse: data });

  return json<LoaderData>({ action, ...response });
};

export const meta: MetaFunction<LoaderData> = ({ data }) => {
  return {
    title: `${data.action.title} | Actions`,
  };
};

export default function WorkflowDetailsPage() {
  const { view, workflowId, breadcrumbs, action } = useLoaderData() as LoaderData;
  const [search] = useSearchParams();
  const actionData = useActionData() as LoaderData;
  const transition = useTransition();

  const currentView = actionData?.view ?? view;
  const currentError = actionData?.error;
  const hasNext = currentView.$type !== 'success' && currentView.$type !== 'error';
  const hasDebug = search.get('debug') === 'true';
  const loading = transition.state === 'loading' || transition.state === 'submitting';

  return (
    <Page title={['Actions', action.title, `Workflow ${workflowId.slice(0, 8)}`]} animationKey={useLocation().key}>
      <SimpleGrid columns={2} spacing={10}>
        <Form method="post">
          <VStack alignItems="flex-start" spacing={6}>
            <FormView name={ROOT} view={currentView} />
            {currentError && (
              <Alert status="error">
                <AlertIcon />
                <VStack alignItems="flex-start" spacing={2}>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription
                    sx={{
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {currentError}
                  </AlertDescription>
                </VStack>
              </Alert>
            )}
            {hasNext && (
              <Button isLoading={loading} colorScheme="teal" variant="solid" type="submit">
                Submit
              </Button>
            )}
          </VStack>
        </Form>
        <VStack alignItems="flex-end" spacing={6}>
          <TableContainer
            backgroundColor="white"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Table variant="simple">
              <Tbody>
                {breadcrumbs.map((breadcrumb, idx) => (
                  <Tr key={`${breadcrumb.key}-${idx}`}>
                    <Td>
                      <Text fontWeight={600}>{breadcrumb.key}</Text>
                    </Td>
                    <Td>{breadcrumb.value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {hasDebug && (
            <Alert status="info" flexDirection="column" alignSelf="flex-start">
              <AlertIcon />
              <AlertTitle>Debug</AlertTitle>
              <AlertDescription sx={{ whiteSpace: 'pre' }}>
                {JSON.stringify({ view, workflowId, breadcrumbs }, null, 2)}
              </AlertDescription>
            </Alert>
          )}
        </VStack>
      </SimpleGrid>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../../components/feedback/ErrorBoundary';
