import GoalScene from "./goal-scene";
import { pageMetadata } from "@/lib/seo.mjs";

export const metadata = pageMetadata("/navisedipro/meta");

export default function MetaPage() {
  return <GoalScene />;
}
