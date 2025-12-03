import type {
  ActionFunctionArgs,
  AppLoadContext,
  LoaderFunctionArgs,
  MetaFunction,
} from 'react-router';
import { Form, useLoaderData } from 'react-router';
import * as React from 'react';

import { Flex, Stack, Field, Input, Button, Box, Checkbox } from '@chakra-ui/react';

import { authenticator, strategies, isAuthenticated } from '../models/auth.server';
import { sessionStorage } from '../models/session.server';
import { getUrl } from '../utils/routes';
import { redirect } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs<AppLoadContext>) => {
  await isAuthenticated(request, {
    successRedirect: getUrl('/'),
  });

  return {
    strategies,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Clone the request so we can read formData without consuming the original
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const intent = formData.get('intent') || 'form';

  if (intent === 'google') {
    // Google auth will throw a redirect to the OAuth provider
    // The callback route will handle setting the session
    try {
      return await authenticator.authenticate('google', request);
    } catch (error) {
      // Re-throw Response objects (redirects)
      if (error instanceof Response) throw error;
      throw error;
    }
  }

  // Handle form login (default)
  try {
    const user = await authenticator.authenticate('form', request);
    const session = await sessionStorage.getSession(request.headers.get('cookie'));
    session.set('user', user);

    throw redirect(getUrl('/'), {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    // If authentication fails, redirect to login
    if (error instanceof Response) throw error;
    if (error instanceof Error) {
      throw redirect(getUrl('/login'));
    }
    throw error;
  }
};

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Login | Runnable',
    },
  ];
};

export default function LoginPage() {
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const { strategies } = useLoaderData<{ strategies: string[] }>();

  const form = (
    <Stack gap={4}>
      <Field.Root id="email">
        <Field.Label>Email address</Field.Label>
        <Input ref={emailRef} type="email" name="email" required />
      </Field.Root>
      <Field.Root id="password">
        <Field.Label>Password</Field.Label>
        <Input ref={passwordRef} type="password" name="password" required />
      </Field.Root>
      <Stack gap={10}>
        <Stack direction={{ base: 'column', sm: 'row' }} align={'start'} justify={'space-between'}>
          <Checkbox.Root id="remember" name="remember">
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Remember me</Checkbox.Label>
          </Checkbox.Root>
        </Stack>
        <Button
          type="submit"
          bg={'blue.400'}
          color={'white'}
          _hover={{
            bg: 'blue.500',
          }}
        >
          Log in
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={'gray.50'}>
      <Box rounded={'lg'} bg={'white'} boxShadow={'lg'} width="340px">
        <Stack gap={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Form method="post">
            {strategies.includes('form') && (
              <>
                <input type="hidden" name="intent" value="form" />
                {form}
              </>
            )}
          </Form>
          <Form method="post">
            {strategies.includes('google') && (
              <>
                <input type="hidden" name="intent" value="google" />
                <Button
                  type="submit"
                  bg={'blue.400'}
                  color={'white'}
                  width="100%"
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  Log in with Google
                </Button>
              </>
            )}
          </Form>
        </Stack>
      </Box>
    </Flex>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
