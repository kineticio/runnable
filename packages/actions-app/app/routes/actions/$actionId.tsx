import { Button } from '@chakra-ui/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Page } from '../../components/layout/Page';

import { defaultContext, DEFAULT_CONTEXT } from '../../models/context';
import type { Action } from '../../api/actions';
import { getUrl } from '../../utils/routes';

type LoaderData = {
  actionId: string;
  action: Action;
};

export const loader: LoaderFunction = async ({ params, context = DEFAULT_CONTEXT }) => {
  context = defaultContext(context);
  invariant(params.actionId, 'actionId not found');
  const action = context.actions[params.actionId];

  return json<LoaderData>({ actionId: params.actionId, action });
};

export default function ActionDetailsPage() {
  const { action, actionId } = useLoaderData() as LoaderData;

  return (
    <Page title={['Actions', action.title]}>
      <Button as={Link} colorScheme="blue" to={getUrl(`/actions/${actionId}/workflows/new`)}>
        New
      </Button>
    </Page>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../../components/feedback/ErrorBoundary';
