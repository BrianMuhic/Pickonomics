import { AuthFooter, AuthForm } from "@/components/AuthForm";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Reset password"
      action={forgotPasswordAction}
      submitLabel="Send reset link"
      fields={
        <>
          <label className="field-label">Email</label>
          <input className="field-input" name="email" type="email" required />
        </>
      }
      footer={<AuthFooter text="Remember your password?" linkText="Log in" href="/login" />}
    />
  );
}
