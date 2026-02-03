
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const projectsService = {
  create: async (workspaceId: string, data: { name: string; description: string; members?: string[] }) => {
    if (!workspaceId) throw new Error("Workspace ID is required to create a project.");
    try {
      return await addDoc(collection(db, "projects"), {
        ...data,
        workspaceId,
        status: 'active',
        members: data.members || [],
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error("Project Service Error:", err);
      throw { code: err.code, message: err.message };
    }
  },
  update: async (projectId: string, updates: any) => {
    try {
      return await updateDoc(doc(db, "projects", projectId), updates);
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  },
  updateMembers: async (projectId: string, memberIds: string[]) => {
    try {
      return await updateDoc(doc(db, "projects", projectId), { members: memberIds });
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  },
  delete: async (projectId: string) => {
    try {
      return await deleteDoc(doc(db, "projects", projectId));
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  }
};
