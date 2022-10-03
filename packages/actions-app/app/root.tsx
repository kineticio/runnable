import { AnimatePresence } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { withEmotionCache } from '@emotion/react';
import { Box, Button, ChakraProvider, Heading, Text, VStack } from '@chakra-ui/react';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from '@remix-run/react';
import { MetaFunction, LinksFunction, json } from '@remix-run/node';

import { ServerStyleContext, ClientStyleContext } from './context';
import { getBaseUrl } from './utils/routes';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Actions',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader() {
  return json({
    ENV: {
      ACTIONS_BASE_URL: process.env.ACTIONS_BASE_URL,
    },
  });
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
}

const Document = withEmotionCache(({ children, head }: DocumentProps, emotionCache) => {
  const data = useLoaderData();
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
          <style key={key} data-emotion={`${key} ${ids.join(' ')}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
      </head>
      <body>
        <ChakraProvider>{children}</ChakraProvider>
        <script dangerouslySetInnerHTML={{ __html: `window.ENV = ${JSON.stringify(data?.ENV)}` }} />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
});

export default function App() {
  return (
    <Document>
      <AnimatePresence exitBeforeEnter>
        <Outlet />
      </AnimatePresence>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document>
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
  const caught = useCatch();
  let message;
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
            as={Link}
            colorScheme="purple"
            bgGradient="linear(to-r, purple.400, purple.500, purple.600)"
            color="white"
            variant="solid"
            to={getBaseUrl()}
          >
            Go to Home
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
    <Document>
      <VStack h="100vh" justify="center">
        {message}
      </VStack>
    </Document>
  );
}
