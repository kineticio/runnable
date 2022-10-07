import { WorkflowId } from '../ids';
import { Workflow } from './workflow.server';

declare global {
  var __workflow_manager__: Map<WorkflowId, Workflow>;
}

export const workflowManagerCache = () => {
  if (!global.__workflow_manager__) {
    global.__workflow_manager__ = new Map();
  }

  return global.__workflow_manager__;
};
