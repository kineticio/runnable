import { MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { WorkflowResponse, WorkflowType } from '@runnablejs/api';

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
