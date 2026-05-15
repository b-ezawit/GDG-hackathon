import { GapWorkspace } from "@/components/gap-workspace";
import { getGroqApiKey } from "@/lib/groq";

export default function CareerPage() {
  return <GapWorkspace mode="career" liveAnalysisAvailable={Boolean(getGroqApiKey())} />;
}