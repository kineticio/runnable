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
import { ActionFunction, MetaFunction, json, LoaderArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useLocation, useNavigation } from '@remix-run/react';
import { WorkflowId, WorkflowResponse, WorkflowType } from '@runnablejs/api';
import invariant from 'tiny-invariant';

import { FormView } from '../components/forms/FormView';
import { TableCellComponent } from '../components/forms/TableCell';
import { Page } from '../components/layout/Page';

import { parseFormData } from '../utils/parseFormData';
import { internalRedirect } from '../utils/internalRedirect';

const ROOT = '__root__';

interface LoaderData extends WorkflowResponse {
  action: WorkflowType;
}

export async function loader({ params, context }: LoaderArgs) {
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const response = await context.client.pickUpWorkflow(params.workflowId as WorkflowId);
  const action = await context.client.listWorkflowTypes().then((actions) => {
    return actions.workflows.find((a) => a.id === params.actionId);
  });

  if (!action) {
    throw internalRedirect(`/`);
  }

  return json<LoaderData>({ action, ...response });
}

export const action: ActionFunction = async ({ request, params, context }) => {
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const runnableAction = await context.client.listWorkflowTypes().then((actions) => {
    return actions.workflows.find((a) => a.id === params.actionId);
  });

  if (!runnableAction) {
    throw internalRedirect(`/`);
  }

  const formData = await request.formData();
  const data = parseFormData<any>(formData)[ROOT] ?? {};

  const response = await context.client.continueWorkflow(params.workflowId as WorkflowId, data);

  return json<LoaderData>({ action: runnableAction, ...response });
};

export const meta: MetaFunction<LoaderData> = ({ data }) => {
  if (!data?.action) return { title: 'Runnable' };

  return {
    title: `${data.action.title} | Runnable`,
  };
};

export default function WorkflowDetailsPage() {
  const { prompt, workflowId, breadcrumbs, action } = useLoaderData() as LoaderData;
  const actionData = useActionData() as LoaderData;
  const transition = useNavigation();

  const currentView = actionData?.prompt ?? prompt;
  const currentError = actionData?.error;
  const hasNext = currentView.$type !== 'terminal';
  const loading = transition.state === 'loading' || transition.state === 'submitting';

  const last8 = workflowId.slice(-8);
  return (
    <Page title={['Actions', action.title, `Workflow ${last8}`]} animationKey={useLocation().key}>
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
                      <TableCellComponent value={breadcrumb.value} />
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

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
