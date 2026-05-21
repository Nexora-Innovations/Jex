// components/RankModal.tsx
// Drop-in rank modal — import and use in views.tsx (or anywhere)
//
// USAGE IN VIEWS.TSX:
// 1. Import: import RankModal from "@/components/RankModal";
// 2. Add state: const [rankTarget, setRankTarget] = useState<{ userId: number; username: string } | null>(null);
// 3. Add modal anywhere in JSX (before closing </>):
//      <RankModal target={rankTarget} onClose={() => setRankTarget(null)} workspaceId={props.workspace.groupId} />
// 4. Add a button in your row actions column:
//      <button onClick={() => setRankTarget({ userId: row.original.info.userId, username: row.original.info.username })}>
//        Change Rank
//      </button>

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IconLoader2, IconShield, IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import toast from "react-hot-toast";
import type { OcRole } from "@/utils/openCloud";

interface Props {
  target: { userId: number; username: string } | null;
  workspaceId: number;
  onClose: () => void;
  onSuccess?: (userId: number, newRole: OcRole) => void;
}

export default function RankModal({ target, workspaceId, onClose, onSuccess }: Props) {
  const [roles, setRoles] = useState<OcRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<OcRole | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch roles when modal opens
  useEffect(() => {
    if (!target) return;
    setRolesLoading(true);
    setRolesError(null);
    setSelectedRole(null);

    axios
      .get(`/api/workspace/${workspaceId}/members/roles`)
      .then((res) => {
        setRoles(res.data.roles ?? []);
      })
      .catch((err) => {
        setRolesError(
          err?.response?.data?.error ?? "Failed to load roles. Check Settings → Integrations."
        );
      })
      .finally(() => setRolesLoading(false));
  }, [target, workspaceId]);

  async function confirmRank() {
    if (!selectedRole || !target) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/workspace/${workspaceId}/members/rank`, {
        userId: target.userId,
        rolePath: selectedRole.path,
      });
      toast.success(`${target.username} ranked to ${selectedRole.displayName}`);
      onSuccess?.(target.userId, selectedRole);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to rank user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Transition appear show={!!target} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                    <IconShield className="w-5 h-5 text-zinc-500" />
                    Change Rank
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Ranking{" "}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {target?.username}
                  </span>{" "}
                  in your group via Open Cloud.
                </p>

                {/* Role picker */}
                {rolesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                ) : rolesError ? (
                  <p className="text-sm text-red-500 dark:text-red-400 py-4">{rolesError}</p>
                ) : (
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {roles.map((role) => (
                      <button
                        key={role.path}
                        onClick={() => setSelectedRole(role)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          selectedRole?.path === role.path
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        <span className="font-medium">{role.displayName}</span>
                        <span
                          className={`text-xs ${
                            selectedRole?.path === role.path
                              ? "text-zinc-300 dark:text-zinc-600"
                              : "text-zinc-400"
                          }`}
                        >
                          Rank {role.rank}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRank}
                    disabled={!selectedRole || submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconCheck className="w-4 h-4" />
                    )}
                    {submitting ? "Ranking…" : "Confirm"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
