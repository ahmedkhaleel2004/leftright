import { Shell } from "~/components/shell";
import { TypingTest } from "~/components/typing-test";

export const revalidate = 3600;

export default function Home() {
  return (
    <Shell>
      <TypingTest />
    </Shell>
  );
}
