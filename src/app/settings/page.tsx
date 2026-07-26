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
    <div className="mx-auto max-w-lg space-y-5">
      <div className="card">
        <h1 className="page-title mb-5">Account Settings</h1>
        <dl className="space-y-4">
          <div>
            <dt className="muted text-xs font-bold uppercase tracking-wider">Name</dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--navy)]">{profile.name}</dd>
          </div>
          <div>
            <dt className="muted text-xs font-bold uppercase tracking-wider">Username</dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--navy)]">@{profile.username}</dd>
          </div>
          <div>
            <dt className="muted text-xs font-bold uppercase tracking-wider">Email</dt>
            <dd className="mt-1 text-lg">{profile.email}</dd>
          </div>
          <div>
            <dt className="muted text-xs font-bold uppercase tracking-wider">Member since</dt>
            <dd className="mt-1">{new Date(profile.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <DeleteAccountSection commissionedLeagueCount={profile._count.commissioned} />
    </div>
  );
}
