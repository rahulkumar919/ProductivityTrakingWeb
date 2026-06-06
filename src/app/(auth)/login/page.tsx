import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Login to DevTrack AI</h1>
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <Label>Mobile Number<Input name="mobileNumber" required /></Label>
          <Label>Password<Input name="password" type="password" required /></Label>
          <Button className="w-full">Login</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">New here? <Link className="font-semibold text-primary" href="/register">Create your account</Link></p>
      </Card>
    </main>
  );
}
