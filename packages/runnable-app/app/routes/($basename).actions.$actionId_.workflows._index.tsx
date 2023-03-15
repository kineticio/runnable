import { ActionFunction, LoaderFunction, MetaFunction, json } from '@remix-run/node';
import { Form, Outlet, useActionData, useLoaderData, useLocation, useTransition } from '@remix-run/react';
import { WorkflowId, WorkflowResponse, WorkflowType } from '@runnablejs/api';
import invariant from 'tiny-invariant';

interface LoaderData extends WorkflowResponse {
  action: WorkflowType;
}

export const meta: MetaFunction<LoaderData> = ({ data }) => {
  if (!data?.action) return { title: 'Runnable' };

  return {
    title: `${data.action.title} | Runnable`,
  };
};

export default function WorkflowDetailsIndex() {
  return <Outlet />;
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
