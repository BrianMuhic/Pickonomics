import { AuthFooter, AuthForm } from "@/components/AuthForm";
import { PasswordInput } from "@/components/PasswordInput";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  return (
    <AuthForm
      title="Log in"
      action={loginAction}
      submitLabel="Log in"
      fields={
        <>
          <label className="field-label">Username or Email</label>
          <input className="field-input" name="login" required />
          <label className="field-label">Password</label>
          <PasswordInput name="password" required minLength={6} />
        </>
      }
      footer={
        <>
          <AuthFooter text="No account?" linkText="Sign up" href="/register" />
          <p className="muted mt-2 text-center text-sm">
            <a href="/forgot-password" className="text-link">
              Forgot password?
            </a>
          </p>
        </>
      }
    />
  );
}
