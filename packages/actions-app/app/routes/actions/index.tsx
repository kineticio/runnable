import { Box, Button, Heading, HStack, HStack, SimpleGrid, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime';
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

export const meta: MetaFunction<LoaderData> = () => {
  return {
    title: 'Actions',
  };
};

export default function ActionsIndexPage() {
  const { actions } = useLoaderData<LoaderData>();

  return (
    <Page title="Actions" animationKey={useLocation().pathname}>
      <Wrap spacing={2} p={2}>
        {Object.entries({ ...actions, ...actions }).map(([key, action]) => (
          <WrapItem key={key}>
            <ActionCard actionId={key} action={action} />
          </WrapItem>
        ))}
      </Wrap>
    </Page>
  );
}

function ActionCard({
  actionId,
  action,
}: {
  actionId: string;
  action: { title: string; description?: string; icon?: string };
}) {
  return (
    <Box
      as={Link}
      m={2}
      p={5}
      shadow="md"
      borderWidth="1px"
      sx={{ ':hover': { shadow: 'lg' } }}
      to={getUrl(`/actions/${actionId}`)}
      borderRadius="md"
      backgroundColor="white"
    >
      <HStack spacing={2}>
        {action.icon ? <Iconify color="teal.700" icon={action.icon} /> : undefined}
        <Heading color="teal.700" fontSize="xl">
          {action.title}
        </Heading>
      </HStack>
      <Text mt={4}>{action.description}</Text>
    </Box>
  );
}
