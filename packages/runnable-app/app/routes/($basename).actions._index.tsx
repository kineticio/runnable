import { Box, Heading, HStack, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { WorkflowType } from '@runnablejs/api';
import { Iconify } from '../components/icons/Iconify';
import { Page } from '../components/layout/Page';
import { getUrl } from '../utils/routes';
import { groupBy } from '../utils/objects';

type LoaderData = {
  actions: WorkflowType[];
};

export const loader: LoaderFunction = async ({ context }) => {
  const actions = await context.client.listWorkflowTypes();
  return json<LoaderData>({ actions: actions.workflows });
};

export const meta: MetaFunction<LoaderData> = () => {
  return {
    title: 'Runnable',
  };
};

export default function ActionsIndexPage() {
  const { actions } = useLoaderData<LoaderData>();

  const categories = groupBy(actions, (action) => action.category || 'Other');
  // sort, but 'Other' comes last
  const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return (
    <Page title="Actions" animationKey={useLocation().pathname}>
      <Stack direction="column" spacing={10}>
        {sortedCategories.map(([category, actionGroup]) => (
          <Stack key={category} direction="column">
            <Heading as="h2" size="lg" color="teal.900">
              {category}
            </Heading>
            <Wrap spacing={4} py={2}>
              {actionGroup.map((action) => (
                <WrapItem key={action.id}>
                  <ActionCard actionId={action.id} action={action} />
                </WrapItem>
              ))}
            </Wrap>
          </Stack>
        ))}
      </Stack>
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
      p={4}
      shadow="md"
      borderWidth="1px"
      width={350}
      minHeight={150}
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
      <Text mt={3}>{action.description}</Text>
    </Box>
  );
}
