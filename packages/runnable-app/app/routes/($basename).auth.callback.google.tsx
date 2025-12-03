import { AppLoadContext, LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';
import { authenticator } from '../models/auth.server';
import { sessionStorage } from '../models/session.server';
import { getUrl } from '../utils/routes';

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs<AppLoadContext>) => {
  try {
    const user = await authenticator.authenticate('google', request);
    const session = await sessionStorage.getSession(request.headers.get('cookie'));
    session.set('user', user);

    return redirect(getUrl('/actions'), {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    // If authentication fails, redirect to login
    if (error instanceof Error) {
      return redirect(getUrl('/login'));
    }
    throw error;
  }
};
