import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { memberships: true, picks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Players</h1>
        <Link href="/admin" className="btn">
          Back
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Leagues</th>
            <th>Picks</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>@{user.username}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isAdmin ? "Yes" : "—"}</td>
              <td>{user._count.memberships}</td>
              <td>{user._count.picks}</td>
              <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
