"use client";

import OrdersDashboard from "@/components/admin/OrdersDashboard";
import MemberSummary from "@/components/admin/member-summary";
import { usePanelSession } from "@/components/admin/panel-session";

export default function PanelHomePage() {
  const { user, permissions } = usePanelSession();
  return permissions.canManage ? (
    <OrdersDashboard />
  ) : (
    <MemberSummary key={user?.id} />
  );
}
