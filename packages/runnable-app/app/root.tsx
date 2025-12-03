import React, { useContext, useEffect } from 'react';
import { withEmotionCache } from '@emotion/react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { Provider } from './components/ui/provider';
import {
  isRouteErrorResponse,
  Link,
  Links,
  LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { MetaFunction, LinksFunction } from 'react-router';

import { getBaseUrl } from './utils/routes';
import { ServerStyleContext, ClientStyleContext } from './styles/context';
import { setRunnableContext } from './api/context';
import { AppLoadContext } from 'react-router';

export const meta: MetaFunction = () => [
  { charset: 'utf-8' },
  { title: 'Runnable' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' },
];

export async function loader(args: LoaderFunctionArgs<AppLoadContext>) {
  setRunnableContext(args.context);

  return {
    ENV: {
      RUNNABLE_BASE_URL: process.env.RUNNABLE_BASE_URL,
      FLY_ALLOC_ID: process.env.FLY_ALLOC_ID,
    },
  };
}

export const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
    },
  ];
};

interface DocumentProps {
  head?: React.ReactNode;
  children: React.ReactNode;
  includeEnv?: boolean;
}

const Document = withEmotionCache(
  ({ children, head, includeEnv = true }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      for (const tag of tags) {
        (emotionCache.sheet as any)._insertTag(tag);
      }
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          {head}
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          <Provider>{children}</Provider>
          {includeEnv && <ProvideEnv />}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  },
);

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

const ProvideEnv = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
      }}
    />
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document includeEnv={false}>
      <VStack h="100vh" justify="center">
        <Heading>There was an error</Heading>
        <Text>{error.message}</Text>
        <hr />
        <Text>
          <div>An unexpected error occurred: {error.message}</div>
        </Text>
      </VStack>
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useRouteError();
  let message;
  if (!isRouteErrorResponse(caught)) {
    return (
      <div>
        <h1>Uh oh ...</h1>
        <p>Something went wrong.</p>
      </div>
    );
  }

  switch (caught.status) {
    case 401: {
      message = (
        <Box textAlign="center" py={10} px={6}>
          <Heading
            display="inline-block"
            as="h2"
            size="2xl"
            bgGradient="linear(to-r, purple.400, purple.600)"
            backgroundClip="text"
          >
            No Access
          </Heading>
          <Text color={'gray.500'} mb={6}>
            The page you are looking for does not seem to exist
          </Text>

          <Button
            colorScheme="purple"
            bgGradient="linear(to-r, purple.400, purple.500, purple.600)"
            color="white"
            variant="solid"
          >
            Go to Home
          </Button>
        </Box>
      );
      break;
    }
    case 404: {
      message = (
        <Box textAlign="center" py={10} px={6}>
          <Heading
            display="inline-block"
            as="h1"
            size="4xl"
            bgGradient="linear(to-r, purple.400, purple.600)"
            backgroundClip="text"
          >
            404
          </Heading>
          <Text fontSize="24px" mt={3} mb={2}>
            Page Not Found
          </Text>
          <Text color={'gray.500'} mb={6}>
            The page you are looking for does not seem to exist
          </Text>

          <Button
            asChild
            colorScheme="purple"
            bgGradient="linear(to-r, purple.400, purple.500, purple.600)"
            color="white"
            variant="solid"
          >
            <Link to={getBaseUrl()}>Go to Home</Link>
          </Button>
        </Box>
      );
      break;
    }

    default: {
      throw new Error(caught.data || caught.statusText);
    }
  }

  return (
    <Document includeEnv={false}>
      <VStack h="100vh" justify="center">
        {message}
      </VStack>
    </Document>
  );
}
