import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";

export default async function SettingsPage() {
  const sessionUser = await requireUser();

  const profile = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      username: true,
      email: true,
      createdAt: true,
      _count: { select: { commissioned: true } },
    },
  });

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="card">
        <h1 className="mb-4 text-2xl font-bold">Account Settings</h1>
        <dl className="space-y-4">
          <div>
            <dt className="muted text-sm font-medium">Name</dt>
            <dd className="mt-1 text-lg">{profile.name}</dd>
          </div>
          <div>
            <dt className="muted text-sm font-medium">Username</dt>
            <dd className="mt-1 text-lg">@{profile.username}</dd>
          </div>
          <div>
            <dt className="muted text-sm font-medium">Email</dt>
            <dd className="mt-1 text-lg">{profile.email}</dd>
          </div>
          <div>
            <dt className="muted text-sm font-medium">Member since</dt>
            <dd className="mt-1">{new Date(profile.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <DeleteAccountSection commissionedLeagueCount={profile._count.commissioned} />
    </div>
  );
}
