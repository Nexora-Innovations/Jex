// components/settings/integrations.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import {
  IconKey,
  IconTrash,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconChevronDown,
  IconExternalLink,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconCircleNumber4,
  IconCircleNumber5,
  IconShield,
  IconApi,
} from "@tabler/icons-react";
import { Disclosure, Transition } from "@headlessui/react";

export default function IntegrationsSettings() {
  const router = useRouter();
  const groupId = router.query.id as string;

  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    axios
      .get(`/api/workspace/${groupId}/settings/opencloud`)
      .then((res) => setHasKey(res.data.hasKey))
      .catch(() => setHasKey(false));
  }, [groupId]);

  async function saveKey() {
    if (!inputKey.trim()) return;
    setSaving(true);
    try {
      await axios.post(`/api/workspace/${groupId}/settings/opencloud`, { apiKey: inputKey.trim() });
      setHasKey(true);
      setInputKey("");
      setShowInput(false);
      toast.success("API key saved and verified!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function deleteKey() {
    setDeleting(true);
    try {
      await axios.delete(`/api/workspace/${groupId}/settings/opencloud`);
      setHasKey(false);
      toast.success("API key removed");
    } catch {
      toast.error("Failed to remove key");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">

      {/* ── Open Cloud API Key Card ── */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-start gap-3">
          <IconKey className="w-5 h-5 mt-0.5 text-zinc-500 shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-zinc-900 dark:text-white">Roblox Open Cloud API Key</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Required for ranking group members directly from Jex.
            </p>

            <div className="mt-4">
              {hasKey === null ? (
                <IconLoader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : hasKey ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                    <IconCheck className="w-4 h-4" />
                    API key configured
                  </span>
                  <button
                    onClick={() => setShowInput(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                  >
                    Replace
                  </button>
                  <button
                    onClick={deleteKey}
                    disabled={deleting}
                    className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deleting ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : <IconTrash className="w-3.5 h-3.5" />}
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowInput(true)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add API key
                </button>
              )}

              {showInput && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Paste your Open Cloud API key..."
                    className="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    onKeyDown={(e) => e.key === "Enter" && saveKey()}
                  />
                  <button
                    onClick={saveKey}
                    disabled={saving || !inputKey.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50"
                  >
                    {saving && <IconLoader2 className="w-3.5 h-3.5 animate-spin" />}
                    {saving ? "Verifying…" : "Save & Verify"}
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setInputKey(""); }}
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <IconAlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>The key is stored in your database and is never exposed to the browser after saving.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Setup Tutorial ── */}
      <Disclosure>
        {({ open }) => (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <Disclosure.Button className="w-full flex items-center justify-between px-5 py-4 text-left">
              <div className="flex items-center gap-2">
                <IconApi className="w-5 h-5 text-zinc-500" />
                <span className="font-medium text-zinc-900 dark:text-white">
                  How to set up Open Cloud ranking
                </span>
              </div>
              <IconChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Disclosure.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-75 ease-out"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <Disclosure.Panel className="px-5 pb-5 space-y-5 border-t border-zinc-100 dark:border-zinc-700 pt-4">

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Roblox Open Cloud lets Jex rank members in your group without needing a bot account.
                  Follow these steps to get it working.
                </p>

                {/* Step 1 */}
                <div className="flex gap-3">
                  <IconCircleNumber1 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Open the Roblox Creator Dashboard
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Go to{" "}
                      <a
                        href="https://create.roblox.com/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
                      >
                        create.roblox.com/credentials
                        <IconExternalLink className="w-3 h-3" />
                      </a>{" "}
                      and sign in with your Roblox account. You must be the group owner or have API key access.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <IconCircleNumber2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Create a new API key
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Click <strong className="text-zinc-700 dark:text-zinc-300">Create API Key</strong>, give it a name like{" "}
                      <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded text-xs">Jex Ranking</code>, then scroll down to the{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">Experience or Group Access</strong> section.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <IconCircleNumber3 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Add your group and set permissions
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Under <strong className="text-zinc-700 dark:text-zinc-300">Select API System</strong> choose{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">Group</strong>, then select your group from the
                      dropdown. Enable these two permissions:
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <IconShield className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <code className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs">group:read</code>
                        <span className="text-zinc-500 dark:text-zinc-400">— so Jex can fetch the list of ranks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IconShield className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <code className="bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs">group:write</code>
                        <span className="text-zinc-500 dark:text-zinc-400">— so Jex can change a member&apos;s rank</span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1">
                      <IconAlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Make sure you add the group specifically — a key without a group attached won&apos;t work even with the right permissions.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <IconCircleNumber4 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Copy and save the key
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Click <strong className="text-zinc-700 dark:text-zinc-300">Save & Generate Key</strong>. Roblox will show
                      your key <strong className="text-zinc-700 dark:text-zinc-300">once</strong> — copy it immediately.
                      Then paste it into the field above and click{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">Save & Verify</strong>. Jex will test it
                      against your group before storing it.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <IconCircleNumber5 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Rank members from the Views page
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Once the key is saved, staff with the{" "}
                      <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded text-xs">manage_members</code> permission
                      will see a <strong className="text-zinc-700 dark:text-zinc-300">Change Rank</strong> button on each
                      member&apos;s row in the Views page. Select a rank from the dropdown and confirm — Jex handles
                      the rest via Open Cloud.
                    </p>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    Common issues
                  </p>
                  <ul className="text-sm text-zinc-500 dark:text-zinc-400 space-y-1.5 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">✗</span>
                      <span><strong className="text-zinc-700 dark:text-zinc-300">"Could not connect"</strong> on Save — the key doesn&apos;t have <code className="bg-zinc-200 dark:bg-zinc-600 px-1 rounded text-xs">group:read</code> or the group wasn&apos;t added to the key.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">✗</span>
                      <span><strong className="text-zinc-700 dark:text-zinc-300">"User is not a member"</strong> on rank — the target user has left the group or the group ID doesn&apos;t match this workspace.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">✗</span>
                      <span><strong className="text-zinc-700 dark:text-zinc-300">403 error</strong> on rank — the key is missing <code className="bg-zinc-200 dark:bg-zinc-600 px-1 rounded text-xs">group:write</code>. Delete and recreate the key with both permissions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">✗</span>
                      <span><strong className="text-zinc-700 dark:text-zinc-300">Can&apos;t rank above your own rank</strong> — Roblox enforces this server-side. The account that owns the API key can only rank members below their own rank in the group.</span>
                    </li>
                  </ul>
                </div>

              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>

    </div>
  );
}
