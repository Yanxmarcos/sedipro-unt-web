import PanelLayout from "@/components/admin/panel-layout";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Panel interno");

export default function PanelLayoutBoundary({ children }) {
  return <PanelLayout>{children}</PanelLayout>;
}
