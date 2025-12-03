import {
  Alert,
  Box,
  Button,
  Grid,
  GridItem,
  Table,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
} from '@chakra-ui/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  type AppLoadContext,
} from 'react-router';
import { Form, useActionData, useLoaderData, useLocation, useNavigation } from 'react-router';
import { WorkflowId, WorkflowResponse, WorkflowType } from '@runnablejs/api';
import invariant from 'tiny-invariant';

import { FormView } from '../components/forms/FormView';
import { TableCellComponent } from '../components/forms/TableCell';
import { Page } from '../components/layout/Page';
import { Iconify } from '../components/icons/Iconify';

import { parseFormData } from '../utils/parseFormData';
import { internalRedirect } from '../utils/internalRedirect';

const ROOT = '__root__';

interface LoaderData extends WorkflowResponse {
  action: WorkflowType;
}

export const loader = async ({ params, context }: LoaderFunctionArgs<AppLoadContext>) => {
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const response = await context.client.pickUpWorkflow(params.workflowId as WorkflowId);
  const action = await context.client
    .listWorkflowTypes()
    .then((actions: { workflows: WorkflowType[] }) => {
      return actions.workflows.find((a: WorkflowType) => a.id === params.actionId);
    });

  if (!action) {
    throw internalRedirect(`/`);
  }

  return { action, ...response };
};

export const action = async ({ request, params, context }: ActionFunctionArgs<AppLoadContext>) => {
  invariant(params.workflowId, 'workflowId not found');
  invariant(params.actionId, 'actionId not found');
  const runnableAction = await context.client
    .listWorkflowTypes()
    .then((actions: { workflows: WorkflowType[] }) => {
      return actions.workflows.find((a: WorkflowType) => a.id === params.actionId);
    });

  if (!runnableAction) {
    throw internalRedirect(`/`);
  }

  const formData = await request.formData();
  const parsedData = parseFormData<Record<string, unknown>>(formData);
  const data: Record<string, unknown> =
    (parsedData[ROOT] as Record<string, unknown> | undefined) ?? ({} as Record<string, unknown>);

  const response = await context.client.continueWorkflow(params.workflowId as WorkflowId, data);

  return { action: runnableAction, ...response };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const loaderData = data as LoaderData | undefined;
  if (!loaderData?.action) return [{ title: 'Runnable' }];

  return [
    {
      title: `${loaderData.action.title} | Runnable`,
    },
  ];
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
      <Grid templateColumns={{ base: '1fr', lg: '1fr 320px' }} width="100%" gap={6}>
        <GridItem>
          <Form method="post">
            <VStack alignItems="stretch" gap={6}>
              <Box
                p={6}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
                backgroundColor="white"
              >
                <VStack gap={5} alignItems="stretch">
                  <HStack justifyContent="space-between">
                    <HStack gap={2}>
                      <Iconify icon="fa6-solid:diagram-project" fontSize="20" color="gray.600" />
                      <Heading size="md" fontWeight="semibold" color="gray.900">
                        Workflow
                      </Heading>
                    </HStack>
                    <Badge colorPalette={hasNext ? 'blue' : 'green'} variant="subtle">
                      {hasNext ? 'In Progress' : 'Completed'}
                    </Badge>
                  </HStack>

                  <FormView name={ROOT} view={currentView} />
                </VStack>
              </Box>

              {currentError && (
                <Alert.Root status="error" colorPalette="red">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description style={{ whiteSpace: 'pre-wrap' }}>
                      {currentError}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              {hasNext && (
                <Box>
                  <Button loading={loading} colorPalette="blue" size="lg" type="submit">
                    <HStack gap={2}>
                      <Text>Continue</Text>
                      <Iconify icon="fa6-solid:arrow-right" />
                    </HStack>
                  </Button>
                </Box>
              )}
            </VStack>
          </Form>
        </GridItem>

        <GridItem>
          {breadcrumbs.length > 0 && (
            <Box position="sticky" top={6}>
              <VStack gap={3} alignItems="stretch">
                <HStack gap={2}>
                  <Iconify icon="fa6-solid:list-check" fontSize="18" color="gray.600" />
                  <Heading size="sm" fontWeight="semibold" color="gray.900">
                    Context
                  </Heading>
                </HStack>

                <Box
                  backgroundColor="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Table.Root variant="outline" size="sm">
                    <Table.Body>
                      {breadcrumbs.map((breadcrumb, idx) => (
                        <Table.Row key={`${breadcrumb.key}-${idx}`}>
                          <Table.Cell
                            fontWeight="semibold"
                            fontSize="xs"
                            color="gray.700"
                            width="40%"
                          >
                            {breadcrumb.key}
                          </Table.Cell>
                          <TableCellComponent value={breadcrumb.value} />
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </VStack>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
