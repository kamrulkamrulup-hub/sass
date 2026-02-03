
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const leadsService = {
  create: async (workspaceId: string, data: any) => {
    if (!workspaceId) throw new Error("Workspace ID is required to create a lead.");
    try {
      return await addDoc(collection(db, "leads"), {
        ...data,
        workspaceId,
        stage: 'new',
        source: 'MANUAL',
        lifecycle: 'LEAD',
        totalOrders: 0,
        totalRevenue: 0,
        score: 0,
        temperature: 'WARM',
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      console.error("Lead Service Error:", err);
      throw { code: err.code, message: err.message };
    }
  },
  updateStage: async (leadId: string, stage: string) => {
    try {
      return await updateDoc(doc(db, "leads", leadId), { stage });
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  }
};
