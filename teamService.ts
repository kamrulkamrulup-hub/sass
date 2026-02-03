
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';

export const teamService = {
  invite: async (workspaceId: string, email: string, role: string) => {
    if (!workspaceId) throw new Error("Workspace ID is required.");
    try {
      // Create invitation doc and return the ref for the frontend to build the link
      return await addDoc(collection(db, "invitations"), {
        workspaceId,
        email: email.toLowerCase(),
        role,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  },
  acceptInvitation: async (inviteId: string, uid: string) => {
    try {
      // In a real app, this would be a transaction or cloud function to ensure atomicity
      // but for client-side only, we perform two steps
      const inviteRef = doc(db, "invitations", inviteId);
      const inviteSnap = await (await import('firebase/firestore')).getDoc(inviteRef);
      
      if (!inviteSnap.exists()) throw new Error("Invitation not found.");
      const data = inviteSnap.data();
      if (data.status !== 'pending') throw new Error("Invitation is no longer valid.");

      const workspaceId = data.workspaceId;
      const role = data.role;

      // Create membership
      await setDoc(doc(db, 'memberships', `${workspaceId}_${uid}`), {
        workspaceId,
        uid,
        role,
        createdAt: serverTimestamp()
      });

      // Update invitation status
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        acceptedBy: uid
      });

      return workspaceId;
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  },
  removeMember: async (membershipId: string) => {
    try {
      return await deleteDoc(doc(db, "memberships", membershipId));
    } catch (err: any) {
      throw { code: err.code, message: err.message };
    }
  }
};
