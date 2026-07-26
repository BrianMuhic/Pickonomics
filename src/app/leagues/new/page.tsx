import { redirect } from "next/navigation";
import { CreateLeagueForm } from "./CreateLeagueForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewLeaguePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="card mx-auto max-w-lg">
      <h1 className="page-title mb-2">Create a League</h1>
      <p className="muted mb-5 text-sm">Set up a private or public pick&apos;em pool.</p>
      <CreateLeagueForm />
    </div>
  );
}
