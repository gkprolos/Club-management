import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Napaka",
        description: "Vpišite e-pošto in geslo"
      });
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
      toast({
        title: "Uspešna prijava",
        description: "Dobrodošli!"
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Napaka pri prijavi",
        description: error.message || "Napačna e-pošta ali geslo"
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Napaka",
        description: "Vpišite e-poštni naslov"
      });
      return;
    }

    try {
      setResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast({
        title: "Povezava poslana",
        description: `Preverite e-pošto ${resetEmail} za navodila za ponastavitev gesla.`
      });
      
      setForgotPasswordOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Napaka",
        description: error.message || "Napaka pri pošiljanju povezave"
      });
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Nalagam...</p>
      </div>);

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <img
              src="/LOGO-2015-C_B.gif"
              alt="Odbojkarski klub Lubnik"
              className="h-24 w-auto mx-auto" />
            
          </div>
          <CardTitle className="text-2xl font-bold">Odbojkarski klub Lubnik Škofja Loka</CardTitle>
          <CardDescription>Prijavite se v svoj račun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-pošta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.si"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting} />
              
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Geslo</Label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotPasswordOpen(true);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Pozabljeno geslo?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting} />
              
            </div>
            <Button type="submit" className="w-full" disabled={loading} style={{ backgroundImage: "none", backgroundColor: "#3b82f6" }}>
              {loading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prijavljanje...
                </> :

              "Prijava"
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ali
                </span>
              </div>
            </div>
            
            <Link href="/login/parent">
              <Button variant="outline" className="w-full mt-4" style={{ backgroundColor: "#06b6d4", backgroundImage: "none" }}>Prijava za starše

              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ponastavitev gesla</DialogTitle>
            <DialogDescription>
              Vnesite vaš e-poštni naslov in poslali vam bomo povezavo za ponastavitev gesla.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-pošta</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="ime@primer.si"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordOpen(false)}
                disabled={resetting}
              >
                Prekliči
              </Button>
              <Button type="submit" disabled={resetting}>
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pošiljam...
                  </>
                ) : (
                  "Pošlji povezavo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>);

}