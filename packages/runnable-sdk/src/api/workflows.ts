import { WorkflowType } from '@runnablejs/api';
import type { RunnableContext } from './context';
import type { InputOutput } from './io';

/**
 * Mapped workflows
 */
export interface RunnableWorkflows {
  [key: string]: RunnableWorkflow;
}

/**
 * Single runnable workflow
 */
export interface RunnableWorkflow extends Omit<WorkflowType, 'id'> {
  /**
   * Action name
   * @example 'Edit User'
   */
  title: string;
  /**
   * Action description
   * @example 'Edit a user's permissions, name, and email.'
   */
  description: string;
  /**
   * Icon to display in the UI
   * These can be Iconify icons, e.g. fa6-solid:user
   * You can find more icons here: https://iconify.design/icon-sets/
   */
  icon: string;

  /**
   * Category to display in the UI
   * @example 'Users'
   * @default 'Other'
   */
  category: string;
  /**
   * Execute the action
   */
  execute: (io: InputOutput, context: RunnableContext) => Promise<void>;
}
