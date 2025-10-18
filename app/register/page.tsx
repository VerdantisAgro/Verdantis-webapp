"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, User, Building2, ArrowRight, Shield, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { UserRole } from "@/types"

export default function RegisterPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: "",
  })

  const handleRegister = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (selectedRole && formData.password === formData.confirmPassword) {
      // In a real app, you would send this to your backend
      router.push(`/dashboard/${selectedRole}`)
    }
  }

  const handleRoleSelect = (role: UserRole): void => {
    setSelectedRole(role)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
                Crie sua <span className="text-primary">conta</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Junte-se ao futuro da rastreabilidade agrícola e transforme sua gestão.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Cadastro Gratuito</div>
                  <div className="text-sm text-muted-foreground">Comece sem custos iniciais</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Dados Protegidos</div>
                  <div className="text-sm text-muted-foreground">Segurança blockchain garantida</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Suporte Completo</div>
                  <div className="text-sm text-muted-foreground">Equipe dedicada ao seu sucesso</div>
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

          {/* Right Side - Register Form */}
          <Card className="p-8 shadow-2xl border-border/20 animate-fade-in-right">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Criar Conta</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados para começar</p>
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

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                {selectedRole === "gestor" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Nome da empresa"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input type="checkbox" required className="mt-1 rounded border-border" />
                  <span className="text-sm text-muted-foreground">
                    Concordo com os{" "}
                    <a href="#" className="text-primary hover:underline">
                      termos de uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-primary hover:underline">
                      política de privacidade
                    </a>
                  </span>
                </div>

                <Button type="submit" size="lg" className="w-full btn-animate hover-glow" disabled={!selectedRole}>
                  {selectedRole
                    ? `Criar conta como ${selectedRole === "produtor" ? "Produtor" : "Gestor"}`
                    : "Selecione um tipo de usuário"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
