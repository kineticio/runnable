export type WorkflowId = string & { readonly brand: unique symbol };
export type NamespaceId = string & { readonly brand: unique symbol };
export type NamespacedWorkflowId = string & { readonly brand: unique symbol };

export function toNamespacedWorkflowId(namespace: NamespaceId, workflowId: WorkflowId): NamespacedWorkflowId {
  return `${namespace}.${workflowId}` as NamespacedWorkflowId;
}

export function parseNamespacedWorkflowId(
  namespacedWorkflowId: NamespacedWorkflowId | string
): [NamespaceId, WorkflowId] {
  const [namespace, workflowId] = namespacedWorkflowId.split('.', 2);
  return [namespace, workflowId] as [NamespaceId, WorkflowId];
}
