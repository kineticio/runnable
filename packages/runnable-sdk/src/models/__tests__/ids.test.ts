import { describe, it, expect } from 'vitest';
import { createWorkflowId } from '../ids';

describe('createWorkflowId', () => {
  it('should create a workflow ID with UUID format when no ID is provided', () => {
    const id = createWorkflowId();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it('should use the provided ID when given', () => {
    const customId = 'custom-workflow-id';
    const id = createWorkflowId(customId);

    expect(id).toBe(customId);
  });

  it('should generate different IDs on subsequent calls', () => {
    const id1 = createWorkflowId();
    const id2 = createWorkflowId();
    const id3 = createWorkflowId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should handle empty string as ID', () => {
    const id = createWorkflowId('');

    expect(id).toBe('');
  });

  it('should preserve special characters in provided ID', () => {
    const customId = 'workflow-123_test@example';
    const id = createWorkflowId(customId);

    expect(id).toBe(customId);
  });
});
