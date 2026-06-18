import { redirect } from "next/navigation";
import { CreateLeagueForm } from "./CreateLeagueForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewLeaguePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="card mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Create a League</h1>
      <CreateLeagueForm />
    </div>
  );
}
