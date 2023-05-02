import { FormControl, FormLabel, Heading, HStack, Select, Stack, Tag, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { parseNamespacedId, WorkflowType } from '@runnablejs/api';
import { useState } from 'react';
import { Iconify } from '../components/icons/Iconify';
import { Page } from '../components/layout/Page';
import { getUrl } from '../utils/routes';
import { groupBy } from '../utils/objects';
import { uniq } from '../utils/array';

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

const defaultNamespace = 'All';

export default function ActionsIndexPage() {
  const { actions } = useLoaderData<LoaderData>();

  // Namespace filter
  const [selectedNamespace, setSelectedNamespace] = useState<string>(defaultNamespace);
  const namespaces = uniq(actions.map((action) => parseNamespacedId(action.id)[0]).filter(Boolean)).sort();

  // Filter actions by namespace
  const filteredActions = selectedNamespace === defaultNamespace ? actions : actions.filter((action) => parseNamespacedId(action.id)[0] === selectedNamespace);

  // Categorize actions
  const categories = groupBy(filteredActions, (action) => action.category);
  const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
    return a.localeCompare(b);
  });


  return (
    <Page title="Actions" animationKey={useLocation().pathname}>
      <FormControl width={350} mb={10}>
        <FormLabel>Namespace</FormLabel>
        <Select
          size='md'
          bg='white'
          value={selectedNamespace}
          onChange={(evt) => {
            setSelectedNamespace(evt.target.value)
          }}
        >
          <option value={defaultNamespace}>All</option>
          {namespaces.map((ns) => (
            <option key={ns} value={ns}>
              {ns}
            </option>
          ))}
        </Select>
      </FormControl>

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
  const [namespace] = parseNamespacedId(actionId);
  return (
    <VStack
      as={Link}
      p={4}
      alignItems="flex-start"
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
      <Text my={3}>{action.description}</Text>
      <Tag size="sm" variant="subtle" colorScheme="cyan">
        {namespace}
      </Tag>
    </VStack>
  );
}
