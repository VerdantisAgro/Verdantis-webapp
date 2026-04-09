"use client"

import type React from "react"
import { AppButton } from "@/src/components/app-button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Leaf, ArrowRight, CheckCircle2, Shield } from "lucide-react"
import { useState } from "react"
import { authApi } from "@/src/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BackgroundOverlayLayout } from "@/src/components/background-overlay-layout"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return
    try {
      const res = await authApi.register({ nomeCompleto: formData.name, email: formData.email, cpf: formData.cpf, senha: formData.password })
      if (res?.token) {
        localStorage.setItem("token", res.token)
        if (res.id) localStorage.setItem("userId", String(res.id))
        if (res.name) localStorage.setItem("userName", res.name)
        if (res.email) localStorage.setItem("userEmail", res.email)
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Register error", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <BackgroundOverlayLayout>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Verdantis</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance leading-[1.1] text-white">
              Crie sua <span className="text-green-400">conta</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed text-pretty">
              Comece a controlar a lucratividade dos seus lotes e tome decisoes melhores para a sua producao.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: CheckCircle2, title: "Cadastro gratuito", desc: "Comece sem custos iniciais" },
              { icon: Shield, title: "Dados protegidos", desc: "Seguranca e privacidade garantidas" },
              { icon: Leaf, title: "Suporte completo", desc: "Equipe dedicada ao seu sucesso" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-white/60">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Register Form */}
        <Card className="p-8 shadow-2xl border-border/50 bg-card/95 backdrop-blur-md">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Criar Conta</h2>
              <p className="text-sm text-muted-foreground">Preencha os dados para comecar</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Joao Silva"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="12345678900"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                />
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" required className="mt-1 rounded border-border" />
                <span className="text-sm text-muted-foreground">
                  Concordo com os{" "}
                  <a href="#" className="text-primary hover:underline">termos de uso</a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline">politica de privacidade</a>
                </span>
              </div>

              <AppButton type="submit" variant="primary" size="lg" className="w-full">
                Criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </AppButton>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Ja tem uma conta?{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                Faca login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </BackgroundOverlayLayout>
  )
}
