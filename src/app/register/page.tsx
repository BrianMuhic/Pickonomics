import { AuthFooter, AuthForm } from "@/components/AuthForm";
import { PasswordInput } from "@/components/PasswordInput";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Create account"
      action={registerAction}
      submitLabel="Sign up"
      fields={
        <>
          <label className="field-label">Name</label>
          <input className="field-input" name="name" required maxLength={100} />
          <label className="field-label">Email</label>
          <input className="field-input" name="email" type="email" required />
          <label className="field-label">Username</label>
          <input
            className="field-input"
            name="username"
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9_]+"
          />
          <label className="field-label">Password</label>
          <PasswordInput name="password" required minLength={6} />
        </>
      }
      footer={<AuthFooter text="Already have an account?" linkText="Log in" href="/login" />}
    />
  );
}
