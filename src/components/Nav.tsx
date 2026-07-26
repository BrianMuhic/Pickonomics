import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionUser } from "@/lib/session";

export function Nav({ user }: { user: SessionUser | null }) {
  return (
    <nav className="site-nav">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="nav-brand">
          <Image src="/logo.png" alt="" width={40} height={40} priority />
          <span className="brand-text">
            Pick<span className="brand-o">o</span>nomics
          </span>
        </Link>
        {user && (
          <div className="nav-links ml-2">
            <Link href="/my-leagues" className="nav-link">
              My Leagues
            </Link>
            <Link href="/leagues/new" className="nav-link">
              Create
            </Link>
            {user.isAdmin && (
              <Link href="/admin" className="nav-link">
                Admin
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <span className="nav-user">@{user.username}</span>
            <Link href="/stats" className="nav-link">
              Stats
            </Link>
            <Link href="/settings" className="nav-link">
              Settings
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
