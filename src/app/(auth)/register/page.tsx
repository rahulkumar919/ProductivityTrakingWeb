import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create DevTrack AI</h1>
        <form action="/api/auth/register" method="post" className="mt-6 space-y-4">
          <Label>Name<Input name="name" required /></Label>
          <Label>Mobile Number<Input name="mobileNumber" required /></Label>
          <Label>Password<Input name="password" type="password" minLength={8} required /></Label>
          <Button className="w-full">Register</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Already registered? <Link className="font-semibold text-primary" href="/login">Login</Link></p>
      </Card>
    </main>
  );
}
