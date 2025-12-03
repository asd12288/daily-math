// modules/topics/server/services/formula.service.ts
// Service for topic formulas CRUD operations

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
// Type TopicFormula available from @/lib/appwrite/types

const { databaseId, collections } = APPWRITE_CONFIG;

/**
 * Formula document from Appwrite (with parsed JSON fields)
 */
export interface FormulaDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  topicId: string;
  courseId: string;
  title: string;
  titleHe?: string;
  latex: string;
  explanation?: string;
  explanationHe?: string;
  category?: string;
  sortOrder: number;
  tags?: string[];
  isCore: boolean;
}

/**
 * Formulas grouped by category
 */
export interface FormulaGroup {
  category: string;
  formulas: FormulaDocument[];
}

/**
 * Parse JSON fields from raw Appwrite document
 */
function parseFormulaDocument(doc: Record<string, unknown>): FormulaDocument {
  return {
    $id: doc.$id as string,
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
    topicId: doc.topicId as string,
    courseId: doc.courseId as string,
    title: doc.title as string,
    titleHe: (doc.titleHe as string) || undefined,
    latex: doc.latex as string,
    explanation: (doc.explanation as string) || undefined,
    explanationHe: (doc.explanationHe as string) || undefined,
    category: (doc.category as string) || undefined,
    sortOrder: (doc.sortOrder as number) || 0,
    tags: doc.tags ? JSON.parse(doc.tags as string) : undefined,
    isCore: (doc.isCore as boolean) || false,
  };
}

/**
 * Get all formulas for a topic
 */
export async function getFormulasByTopic(topicId: string): Promise<FormulaDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicFormulas,
      [
        Query.equal("topicId", topicId),
        Query.orderAsc("sortOrder"),
        Query.limit(100),
      ]
    );

    return response.documents.map(parseFormulaDocument);
  } catch {
    return [];
  }
}

/**
 * Get all formulas for a course (for cheat sheet)
 */
export async function getFormulasByCourse(courseId: string): Promise<FormulaDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicFormulas,
      [
        Query.equal("courseId", courseId),
        Query.orderAsc("sortOrder"),
        Query.limit(500),
      ]
    );

    return response.documents.map(parseFormulaDocument);
  } catch {
    return [];
  }
}

/**
 * Get formulas grouped by category
 */
export async function getFormulasGroupedByCategory(
  topicId: string
): Promise<FormulaGroup[]> {
  const formulas = await getFormulasByTopic(topicId);

  const groupedMap = new Map<string, FormulaDocument[]>();

  for (const formula of formulas) {
    const category = formula.category || "General";
    if (!groupedMap.has(category)) {
      groupedMap.set(category, []);
    }
    groupedMap.get(category)!.push(formula);
  }

  return Array.from(groupedMap.entries()).map(([category, formulas]) => ({
    category,
    formulas,
  }));
}

/**
 * Get core formulas only (essential formulas)
 */
export async function getCoreFormulas(topicId: string): Promise<FormulaDocument[]> {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.topicFormulas,
      [
        Query.equal("topicId", topicId),
        Query.equal("isCore", true),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]
    );

    return response.documents.map(parseFormulaDocument);
  } catch {
    return [];
  }
}

/**
 * Create a new formula
 */
export async function createFormula(
  data: Omit<FormulaDocument, "$id" | "$createdAt" | "$updatedAt">
): Promise<FormulaDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const doc = await databases.createDocument(
      databaseId,
      collections.topicFormulas,
      "unique()",
      {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      }
    );
    return parseFormulaDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Update an existing formula
 */
export async function updateFormula(
  formulaId: string,
  data: Partial<Omit<FormulaDocument, "$id" | "$createdAt" | "$updatedAt">>
): Promise<FormulaDocument | null> {
  const { databases } = await createAdminClient();

  try {
    const updateData = { ...data };
    if (data.tags) {
      (updateData as Record<string, unknown>).tags = JSON.stringify(data.tags);
    }

    const doc = await databases.updateDocument(
      databaseId,
      collections.topicFormulas,
      formulaId,
      updateData
    );
    return parseFormulaDocument(doc);
  } catch {
    return null;
  }
}

/**
 * Delete a formula
 */
export async function deleteFormula(formulaId: string): Promise<boolean> {
  const { databases } = await createAdminClient();

  try {
    await databases.deleteDocument(
      databaseId,
      collections.topicFormulas,
      formulaId
    );
    return true;
  } catch {
    return false;
  }
}
