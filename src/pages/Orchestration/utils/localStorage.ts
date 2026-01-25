import type { Workflow } from "@/types/workflow";

const WORKFLOWS_KEY = "gradmind-workflows";

/**
 * Load all workflows from localStorage
 */
export function loadWorkflowsFromStorage(): Workflow[] {
  try {
    const saved = localStorage.getItem(WORKFLOWS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load workflows from localStorage:", error);
  }
  return [];
}

/**
 * Save workflows to localStorage
 */
export function saveWorkflowsToStorage(workflows: Workflow[]): void {
  try {
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  } catch (error) {
    console.error("Failed to save workflows to localStorage:", error);
  }
}

/**
 * Save a single workflow to localStorage
 */
export function saveWorkflowToStorage(workflow: Workflow): void {
  const workflows = loadWorkflowsFromStorage();
  const existingIndex = workflows.findIndex((w) => w.id === workflow.id);

  if (existingIndex >= 0) {
    workflows[existingIndex] = workflow;
  } else {
    workflows.push(workflow);
  }

  saveWorkflowsToStorage(workflows);
}

/**
 * Delete a workflow from localStorage
 */
export function deleteWorkflowFromStorage(workflowId: string): void {
  const workflows = loadWorkflowsFromStorage();
  const filtered = workflows.filter((w) => w.id !== workflowId);
  saveWorkflowsToStorage(filtered);
}

/**
 * Get a single workflow by ID
 */
export function getWorkflowById(workflowId: string): Workflow | null {
  const workflows = loadWorkflowsFromStorage();
  return workflows.find((w) => w.id === workflowId) || null;
}
