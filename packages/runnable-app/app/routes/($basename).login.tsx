import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import * as React from 'react';

import { Flex, Stack, FormControl, Input, Button, Box, Checkbox, FormLabel } from '@chakra-ui/react';

import { namedAction } from 'remix-utils';
import { authenticator, strategies } from '../models/auth.server';

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });

  return json({
    strategies,
  });
};

export async function action({ request }: ActionArgs) {
  // @ts-expect-error - types are wrong
  return namedAction(request, {
    async form() {
      return await authenticator.authenticate('form', request, {
        successRedirect: '/',
        failureRedirect: '/login',
      });
    },
    async google() {
      return await authenticator.authenticate('google', request);
    },
  });
}

export const meta: MetaFunction = () => {
  return {
    title: 'Login | Runnable',
  };
};

export default function LoginPage() {
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const { strategies } = useLoaderData<typeof loader>();

  const form = (
    <Stack spacing={4}>
      <FormControl id="email">
        <FormLabel>Email address</FormLabel>
        <Input ref={emailRef} type="email" name="email" required />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input ref={passwordRef} type="password" name="password" required />
      </FormControl>
      <Stack spacing={10}>
        <Stack direction={{ base: 'column', sm: 'row' }} align={'start'} justify={'space-between'}>
          <Checkbox id="remember" name="remember">
            Remember me
          </Checkbox>
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
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Form method="post" action="?/form">
            {strategies.includes('form') && form}
          </Form>
          <Form method="post" action="?/google">
            {strategies.includes('google') && (
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
            )}
          </Form>
        </Stack>
      </Box>
    </Flex>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
