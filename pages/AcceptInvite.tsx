
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useApp } from '../store';
import { teamService } from '../teamService';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('inviteId');
  const navigate = useNavigate();
  const { user, isInitialLoading, switchWorkspace, setLastError } = useApp();

  const [invitation, setInvitation] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setError("Missing invitation ID.");
      setLoading(false);
      return;
    }

    const loadInvite = async () => {
      try {
        const inviteRef = doc(db, "invitations", inviteId);
        const inviteSnap = await getDoc(inviteRef);
        
        if (!inviteSnap.exists()) {
          setError("This invitation link is invalid or has expired.");
          return;
        }

        const data = inviteSnap.data();
        if (data.status !== 'pending') {
          setError("This invitation has already been accepted or revoked.");
          return;
        }

        setInvitation(data);

        // Load workspace name
        const wsRef = doc(db, "workspaces", data.workspaceId);
        const wsSnap = await getDoc(wsRef);
        if (wsSnap.exists()) {
          setWorkspace(wsSnap.data());
        }
      } catch (err: any) {
        setError(err.message || "Failed to load invitation.");
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [inviteId]);

  const handleAccept = async () => {
    if (!user || !inviteId) return;
    setProcessing(true);
    try {
      const workspaceId = await teamService.acceptInvitation(inviteId, user.id);
      switchWorkspace(workspaceId);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
      setLastError({ ...err, action: "Accept Invitation" });
    } finally {
      setProcessing(false);
    }
  };

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-slate-500 font-medium">Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Oops!</h1>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">{error}</p>
        <Link to="/dashboard" className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
          <UserPlus size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900">Join Workspace</h1>
        <p className="text-slate-500 mt-2">
          You've been invited to join <span className="font-bold text-indigo-600">{workspace?.name || 'a workspace'}</span> as a <span className="font-bold text-slate-700">{invitation?.role}</span>.
        </p>

        {!user ? (
          <div className="mt-10 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex items-start gap-3 text-left leading-relaxed">
              <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
              You need to sign in or create an account to accept this invitation.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Accepting as {user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
              </div>
            </div>

            <button 
              onClick={handleAccept}
              disabled={processing}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
            >
              {processing ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  Accept & Continue
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 font-medium">By clicking accept, you will gain access to this workspace's projects, tasks, and CRM data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
