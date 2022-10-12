import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import * as React from 'react';

import { Flex, Stack, FormControl, Input, Button, Box, Checkbox, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { defaultContext } from '../models/context';

import { internalRedirect } from '../utils/routes';
import { safeRedirect, validateEmail } from '~/utils/utils';
import { createUserSession, getUserId } from '~/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return internalRedirect('/');
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request, context }) => {
  context = defaultContext(context);

  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/actions');
  const remember = formData.get('remember');

  if (!validateEmail(email)) {
    return json<ActionData>({ errors: { email: 'Email is invalid' } }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length === 0) {
    return json<ActionData>({ errors: { password: 'Password is required' } }, { status: 400 });
  }

  let user;
  try {
    user = await context.auth.verifyLogin({ email, password });
  } catch (error: any) {
    return json<ActionData>({ errors: { email: error.message } }, { status: 400 });
  }

  if (!user) {
    return json<ActionData>({ errors: { email: 'Invalid email or password' } }, { status: 400 });
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === 'on' ? true : false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: 'Login | Runnable',
  };
};

export default function LoginPage() {
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={'gray.50'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Form method="post" className="space-y-6">
          <Box rounded={'lg'} bg={'white'} boxShadow={'lg'} p={8} width="340px">
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={!!actionData?.errors?.email}>
                <FormLabel>Email address</FormLabel>
                <Input ref={emailRef} type="email" name="email" required />
                <FormErrorMessage>{actionData?.errors?.email}</FormErrorMessage>
              </FormControl>
              <FormControl id="password" isInvalid={!!actionData?.errors?.password}>
                <FormLabel>Password</FormLabel>
                <Input ref={passwordRef} type="password" name="password" required />
                <FormErrorMessage>{actionData?.errors?.password}</FormErrorMessage>
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
          </Box>
        </Form>
      </Stack>
    </Flex>
  );
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
