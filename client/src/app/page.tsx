import { AppClient } from "@/components/AppClient";

export default function Page() {
  return (
    <div className="h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex flex-col lg:flex-row overflow-hidden">
      <AppClient />
    </div>
  );
}
