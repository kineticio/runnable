import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Grid,
  GridItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { ActionFunction, LoaderFunction, MetaFunction, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useLocation, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { FormView } from '../../components/forms/FormView';
import { TableCell } from '../../components/forms/TableCell';
import { Page } from '../../components/layout/Page';
import { defaultContext } from '../../models/context';

import type { WorkflowId } from '../../models/ids';
import { WORKFLOW_MANAGER } from '../../models/workflows/workflow-manager.server';
import { Action } from '../../types';
import type { ActionResponse } from '../../types/response';
import { parseFormData } from '../../utils/parseFormData';
import { internalRedirect } from '../../utils/routes';

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

  if (!action) {
    throw internalRedirect(`/`);
  }

  return json<LoaderData>({ action, ...response });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  context = defaultContext(context);
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const runnableAction = context.actions[params.actionId];

  const formData = await request.formData();
  const data = parseFormData<any>(formData)[ROOT] ?? {};

  const response = await WORKFLOW_MANAGER.continueWorkflow(params.workflowId as WorkflowId, { ioResponse: data });

  return json<LoaderData>({ action: runnableAction, ...response });
};

export const meta: MetaFunction<LoaderData> = ({ data }) => {
  return {
    title: `${data.action.title} | Runnable`,
  };
};

export default function WorkflowDetailsPage() {
  const { view, workflowId, breadcrumbs, action } = useLoaderData() as LoaderData;
  const actionData = useActionData() as LoaderData;
  const transition = useTransition();

  const currentView = actionData?.view ?? view;
  const currentError = actionData?.error;
  const hasNext = currentView.$type !== 'terminal';
  const loading = transition.state === 'loading' || transition.state === 'submitting';

  return (
    <Page title={['Actions', action.title, `Workflow ${workflowId.slice(0, 8)}`]} animationKey={useLocation().key}>
      <Grid templateColumns="repeat(5, 1fr)" width="100%" gap={2}>
        <GridItem colSpan={4}>
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
                  Continue
                </Button>
              )}
            </VStack>
          </Form>
        </GridItem>
        <GridItem colSpan={1}>
          {breadcrumbs.length > 0 && (
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
                      <TableCell value={breadcrumb.value} />
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </GridItem>
      </Grid>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../../components/feedback/ErrorBoundary';
