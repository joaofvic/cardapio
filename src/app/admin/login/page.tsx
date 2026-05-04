import { LoginForm } from './login-form';

export const metadata = {
  title: 'Admin · Harvest Bites',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo ?? '/adminconfiguration';

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 border border-border/40">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase">
            Harvest Admin
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            Acesso restrito ao gerente
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
