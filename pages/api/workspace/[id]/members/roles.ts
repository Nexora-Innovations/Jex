// pages/api/workspace/[id]/members/roles.ts
// Returns the group's Open Cloud roles so the frontend can show a rank picker
import type { NextApiRequest, NextApiResponse } from "next";
import { withPermissionCheck } from "@/utils/permissionsManager";
import { getConfig } from "@/utils/configEngine";
import { getGroupRoles } from "@/utils/openCloud";
import type { OcRole } from "@/utils/openCloud";

type Data = { success: boolean; roles?: OcRole[]; error?: string };

export default withPermissionCheck(handler);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const groupId = parseInt(req.query.id as string);
  if (isNaN(groupId)) {
    return res.status(400).json({ success: false, error: "Invalid workspace ID" });
  }

  try {
    const config = await getConfig("openCloudApiKey", groupId) as { apiKey?: string | null } | null;
    if (!config?.apiKey) {
      return res.status(400).json({
        success: false,
        error: "No Open Cloud API key configured. Add one in Settings → Integrations.",
      });
    }

    const roles = await getGroupRoles(config.apiKey, groupId);
    // Sort by rank number, exclude guest rank (0)
    const sorted = roles
      .filter((r) => r.rank > 0)
      .sort((a, b) => a.rank - b.rank);

    return res.status(200).json({ success: true, roles: sorted });
  } catch (err: any) {
    console.error("[members/roles]", err);
    return res.status(500).json({ success: false, error: err.message ?? "Failed to fetch roles" });
  }
}
