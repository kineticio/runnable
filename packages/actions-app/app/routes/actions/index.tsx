import { Button, SimpleGrid, VStack } from '@chakra-ui/react';
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { Iconify } from '../../components/icons/Iconify';
import { Page } from '../../components/layout/Page';
import { getUrl } from '../../utils/routes';
import type { Actions } from '~/api/actions';
import { defaultContext, DEFAULT_CONTEXT } from '~/models/context';

type LoaderData = {
  actions: Actions;
};

export const loader: LoaderFunction = async ({ context = DEFAULT_CONTEXT }) => {
  context = defaultContext(context);
  return json<LoaderData>({ actions: context.actions });
};

export default function ActionsIndexPage() {
  const { actions } = useLoaderData<LoaderData>();

  return (
    <Page title="Actions">
      <SimpleGrid column={2}>
        <VStack mx={0} gap={2} spacing="md" sx={{ alignItems: 'flex-start' }}>
          {Object.entries(actions).map(([key, action]) => (
            <Button
              as={Link}
              key={key}
              leftIcon={action.icon ? <Iconify icon={action.icon} /> : undefined}
              colorScheme="blue"
              to={getUrl(`/actions/${key}`)}
            >
              {action.title}
            </Button>
          ))}
        </VStack>
      </SimpleGrid>
    </Page>
  );
}
