
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const tasksService = {
  create: async (workspaceId: string, userId: string, data: any) => {
    if (!workspaceId) throw new Error("Workspace ID is required to create a task.");
    try {
      return await addDoc(collection(db, "tasks"), {
        workspaceId,
        projectId: data.projectId || '',
        title: data.title,
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null,
        createdBy: userId,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error("Task Service Error:", err);
      throw { code: err.code, message: err.message };
    }
  },
  update: async (taskId: string, updates: any) => {
    try {
      return await updateDoc(doc(db, "tasks", taskId), updates);
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  },
  delete: async (taskId: string) => {
    try {
      return await deleteDoc(doc(db, "tasks", taskId));
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  }
};
