import {
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import type { AppLoadContext, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { Link, Outlet, useLoaderData, useLocation } from 'react-router';
import invariant from 'tiny-invariant';

import { parseNamespacedId, WorkflowType } from '@runnablejs/api';
import { Page } from '../components/layout/Page';
import { Iconify } from '../components/icons/Iconify';

import { getUrl } from '../utils/routes';
import { internalRedirect } from '../utils/internalRedirect';

type LoaderData = {
  actionId: string;
  namespace: string;
  action: WorkflowType;
};

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData?.action) return [{ title: 'Runnable' }];

  return [
    {
      title: `${loaderData.action.title} | Runnable`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs<AppLoadContext>) => {
  invariant(params.actionId, 'actionId not found');
  const [namespace, actionId] = parseNamespacedId(params.actionId);
  const actions = await context.client.listWorkflowTypes(namespace);
  const action = actions.workflows.find((action: any) => action.id === params.actionId);

  if (!action) {
    console.error(`Cannot find action ${actionId} in namespace ${namespace}`);
    console.error(
      `Available actions: ${actions.workflows.map((action: any) => action.id).join(', ')}`,
    );
    throw internalRedirect(`/`);
  }

  return { actionId, namespace, action };
};

export default function ActionDetailsPage() {
  const { namespace, action, actionId } = useLoaderData<LoaderData>();

  if (!action) return <div>Cannot find action {actionId}</div>;

  return (
    <Page title={['Actions', action.title]} animationKey={useLocation().pathname}>
      <VStack gap={6} alignItems="stretch">
        {/* Header Card */}
        <Box
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          backgroundColor="white"
        >
          <Grid templateColumns="1fr auto" gap={6} alignItems="start">
            <GridItem>
              <VStack gap={4} alignItems="flex-start">
                <HStack gap={3}>
                  {action.icon && (
                    <Box p={3} borderRadius="lg" backgroundColor="blue.50" color="blue.600">
                      <Iconify fontSize="28" icon={action.icon} />
                    </Box>
                  )}
                  <Box>
                    <Heading size="xl" mb={2} color="gray.900">
                      {action.title}
                    </Heading>
                    <HStack gap={2}>
                      <Badge colorPalette="blue" variant="subtle">
                        {namespace}
                      </Badge>
                      {action.category && (
                        <Badge colorPalette="gray" variant="outline">
                          {action.category}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>

                {action.description && (
                  <Text color="gray.600" fontSize="md" lineHeight="1.7">
                    {action.description}
                  </Text>
                )}
              </VStack>
            </GridItem>

            <GridItem>
              <Button size="lg" colorPalette="blue" asChild>
                <Link to={getUrl(`/actions/${namespace}.${actionId}/workflows/new`)}>
                  <HStack gap={2}>
                    <Iconify icon="fa6-solid:plus" />
                    <Text>New Workflow</Text>
                  </HStack>
                </Link>
              </Button>
            </GridItem>
          </Grid>
        </Box>
      </VStack>
      <Outlet />
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
