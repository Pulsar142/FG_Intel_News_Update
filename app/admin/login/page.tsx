import { LoginForm } from "@/app/components/LoginForm";
import { adminLoginAction } from "@/app/actions/auth";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 dot-grid">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8 shadow-2xl">
        <p className="mb-1 text-center font-mono text-xs tracking-[0.3em] text-gold">
          COMMAND ACCESS
        </p>
        <h1 className="stencil mb-6 text-center text-2xl text-foreground">Admin Login</h1>
        <LoginForm action={adminLoginAction} submitLabel="Authenticate" />
      </div>
    </main>
  );
}
