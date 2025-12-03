export type WorkflowId = string & { readonly brand: unique symbol };
export type WorkflowTypeId = string & { readonly brand: unique symbol };
export type NamespaceId = string & { readonly brand: unique symbol };
export type NamespacedWorkflowId = string & { readonly brand: unique symbol };
export type NamespacedWorkflowTypeId = string & {
  readonly brand: unique symbol;
};

export function toNamespacedId(namespace: NamespaceId, id: WorkflowId): NamespacedWorkflowId;
export function toNamespacedId(
  namespace: NamespaceId,
  id: WorkflowTypeId,
): NamespacedWorkflowTypeId;
export function toNamespacedId<T extends WorkflowTypeId>(
  namespace: NamespaceId,
  id: string,
): NamespacedWorkflowTypeId;
export function toNamespacedId<T extends WorkflowId>(
  namespace: NamespaceId,
  id: string,
): NamespacedWorkflowId;
export function toNamespacedId(namespace: NamespaceId, id: string): string {
  return `${namespace}.${id}` as NamespacedWorkflowId;
}

export function parseNamespacedId(id: WorkflowId): [NamespaceId, WorkflowId];
export function parseNamespacedId(id: WorkflowTypeId): [NamespaceId, WorkflowTypeId];
export function parseNamespacedId(id: NamespacedWorkflowTypeId): [NamespaceId, WorkflowTypeId];
export function parseNamespacedId(id: NamespacedWorkflowId): [NamespaceId, WorkflowId];
export function parseNamespacedId<T>(id: string): [NamespaceId, T];
export function parseNamespacedId(id: string): [string, string] {
  if (!id.includes('.')) {
    return ['main', id];
  }

  const [namespace, workflowId] = id.split('.', 2);
  return [namespace, workflowId] as [string, string];
}
