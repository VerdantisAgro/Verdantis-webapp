"use client"

import type React from "react"
import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Leaf, User, Building2, ArrowRight, Shield } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/src/types"

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (selectedRole) {
      router.push(`/dashboard/${selectedRole}`)
    }
  }

  const handleRoleSelect = (role: UserRole): void => {
    setSelectedRole(role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/farmland-background.jpg')] bg-cover bg-center opacity-5"></div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="space-y-8 animate-fade-in-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center animate-pulse-glow">
                  <Leaf className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-3xl font-bold text-foreground">Verdantis</span>
                  <Badge variant="secondary" className="ml-2">
                    VITS
                  </Badge>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-balance leading-tight">
                Acesse sua <span className="text-primary">plataforma</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Sistema de rastreabilidade e gestão inteligente para o agronegócio brasileiro.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Segurança Blockchain</div>
                  <div className="text-sm text-muted-foreground">Dados protegidos e imutáveis</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Certificação Sustentável</div>
                  <div className="text-sm text-muted-foreground">Acesso a mercados globais</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/20">
              <a
                href="https://challenge-oracle-hazel.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-2"
              >
                <span>Saiba mais sobre o Verdantis →</span>
              </a>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="p-8 shadow-2xl border-border/20 animate-fade-in-right">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Entrar no Sistema</h2>
                <p className="text-sm text-muted-foreground">Selecione seu tipo de acesso e faça login</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Tipo de Usuário</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("produtor")}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      selectedRole === "produtor"
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          selectedRole === "produtor" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <User className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Produtor</div>
                        <div className="text-xs text-muted-foreground">Gestão da fazenda</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("gestor")}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      selectedRole === "gestor"
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          selectedRole === "gestor" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Gestor</div>
                        <div className="text-xs text-muted-foreground">Analytics e relatórios</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Lembrar de mim</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>

                <Button type="submit" size="lg" className="w-full btn-animate hover-glow" disabled={!selectedRole}>
                  {selectedRole
                    ? `Entrar como ${selectedRole === "produtor" ? "Produtor" : "Gestor"}`
                    : "Selecione um tipo de usuário"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Cadastre-se gratuitamente
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
