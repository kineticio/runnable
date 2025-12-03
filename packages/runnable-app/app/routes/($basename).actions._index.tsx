import { Heading, HStack, Stack, Text, VStack, Grid, Box, Badge } from '@chakra-ui/react';
import { Link, useLoaderData, useLocation } from 'react-router';
import type { AppLoadContext, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { parseNamespacedId, WorkflowType } from '@runnablejs/api';
import { useState } from 'react';
import { Iconify } from '../components/icons/Iconify';
import { Page } from '../components/layout/Page';
import { getUrl } from '../utils/routes';
import { groupBy } from '../utils/objects';
import { uniq } from '../utils/array';
import { NativeSelectField, NativeSelectRoot } from '../components/ui/native-select';

type LoaderData = {
  actions: WorkflowType[];
};

export const loader = async (args: LoaderFunctionArgs<AppLoadContext>) => {
  const actions = await args.context.client.listWorkflowTypes();
  return { actions: actions.workflows };
};

export const meta: MetaFunction<LoaderData> = () => {
  return [
    {
      title: 'Runnable',
    },
  ];
};

const defaultNamespace = 'All';

export default function ActionsIndexPage() {
  const { actions } = useLoaderData<LoaderData>();
  const namespaces = uniq(
    actions.map((action) => parseNamespacedId(action.id)[0]).filter(Boolean),
  ).sort();

  // Namespace filter
  const [selectedNamespace, setSelectedNamespace] = useState<string>(() => {
    if (namespaces.length === 1) {
      return namespaces[0];
    }
    return defaultNamespace;
  });

  // Filter actions by namespace
  const filteredActions =
    selectedNamespace === defaultNamespace
      ? actions
      : actions.filter((action) => parseNamespacedId(action.id)[0] === selectedNamespace);

  // Categorize actions
  const categories = groupBy(filteredActions, (action) => action.category);
  const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
    return a.localeCompare(b);
  });

  return (
    <Page title="Actions" animationKey={useLocation().pathname}>
      <VStack gap={6} alignItems="stretch">
        {/* Stats and Filter Section */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Total Actions
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              {filteredActions.length}
            </Text>
          </Box>

          <Box width="240px">
            <NativeSelectRoot size="sm">
              <NativeSelectField
                value={selectedNamespace}
                onChange={(evt) => setSelectedNamespace(evt.target.value)}
              >
                <option value={defaultNamespace}>All Namespaces</option>
                {namespaces.map((ns) => (
                  <option key={ns} value={ns}>
                    {ns}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Box>
        </HStack>

        {/* Actions Grid */}
        <Stack direction="column" gap={8}>
          {sortedCategories.map(([category, actionGroup]) => (
            <Stack key={category} direction="column" gap={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading as="h2" size="md" fontWeight="semibold" color="gray.900">
                  {category}
                </Heading>
                <Badge size="sm" colorPalette="gray">
                  {actionGroup.length}
                </Badge>
              </HStack>
              <Grid
                templateColumns={{
                  base: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                }}
                gap={4}
              >
                {actionGroup.map((action) => (
                  <ActionCard key={action.id} actionId={action.id} action={action} />
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>
      </VStack>
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
    <Box
      asChild
      p={5}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      backgroundColor="white"
      transition="all 0.2s"
      cursor="pointer"
      _hover={{
        borderColor: 'gray.300',
        shadow: 'md',
        transform: 'translateY(-2px)',
      }}
    >
      <Link to={getUrl(`/actions/${actionId}`)}>
        <VStack gap={3} alignItems="flex-start">
          <HStack gap={3} width="full" justifyContent="space-between">
            <HStack gap={2.5}>
              {action.icon && (
                <Box p={2} borderRadius="md" backgroundColor="blue.50" color="blue.600">
                  <Iconify fontSize="20" icon={action.icon} />
                </Box>
              )}
              <Heading fontSize="lg" fontWeight="semibold" color="gray.900">
                {action.title}
              </Heading>
            </HStack>
          </HStack>

          <Text fontSize="sm" color="gray.600" lineHeight="1.6" lineClamp={2}>
            {action.description || 'No description available'}
          </Text>

          <HStack mt={1}>
            <Badge size="sm" colorPalette="blue" variant="subtle">
              {namespace}
            </Badge>
          </HStack>
        </VStack>
      </Link>
    </Box>
  );
}
