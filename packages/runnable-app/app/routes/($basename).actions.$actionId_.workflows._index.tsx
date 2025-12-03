import { MetaFunction } from 'react-router';
import { Outlet } from 'react-router';
import { WorkflowResponse, WorkflowType } from '@runnablejs/api';

interface LoaderData extends WorkflowResponse {
  action: WorkflowType;
}

export const meta: MetaFunction = ({ data }) => {
  const loaderData = data as LoaderData | undefined;
  if (!loaderData?.action) return [{ title: 'Runnable' }];

  return [
    {
      title: `${loaderData.action.title} | Runnable`,
    },
  ];
};

export default function WorkflowDetailsIndex() {
  return <Outlet />;
}

export { DefaultCatchBoundary as CatchBoundary } from '../components/feedback/CatchBoundary';
export { LargeErrorBoundary as ErrorBoundary } from '../components/feedback/ErrorBoundary';
