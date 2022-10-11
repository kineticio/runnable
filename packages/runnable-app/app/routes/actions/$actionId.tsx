import { Button, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Page } from '../../components/layout/Page';

import { defaultContext, DEFAULT_CONTEXT } from '../../models/context';
import type { Action } from '../../api/actions';
import { getUrl, internalRedirect } from '../../utils/routes';

type LoaderData = {
  actionId: string;
  action: Action;
};

export const meta: MetaFunction<LoaderData> = ({ data }) => {
  return {
    title: `${data.action.title} | Actions`,
  };
};

export const loader: LoaderFunction = async ({ params, context = DEFAULT_CONTEXT }) => {
  context = defaultContext(context);
  invariant(params.actionId, 'actionId not found');
  const action = context.actions[params.actionId];

  if (!action) {
    throw internalRedirect(`/`);
  }

  return json<LoaderData>({ actionId: params.actionId, action });
};

export default function ActionDetailsPage() {
  const { action, actionId } = useLoaderData() as LoaderData;

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
          to={getUrl(`/actions/${actionId}/workflows/new`)}
        >
          New
        </Button>
      </VStack>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../../components/feedback/ErrorBoundary';
