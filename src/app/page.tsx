"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Leaf, ArrowRight, TrendingUp, BarChart3, Shield, Grid3x3, Sprout, LineChart } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/src/api"

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    ;(async () => {
      try {
        const res = await authApi.login({ email, senha: password })
        if (res?.token) {
          localStorage.setItem("token", res.token)
          if (res.id) localStorage.setItem("userId", String(res.id))
          if (res.name) localStorage.setItem("userName", res.name)
          if (res.email) localStorage.setItem("userEmail", res.email)
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Login error", err)
      }
    })()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Login */}
      <section className="relative min-h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/farmland-background.jpg')" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
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
                  Gerencie sua fazenda com <span className="text-green-400">inteligencia</span>
                </h1>
                <p className="text-lg text-white/80 leading-relaxed text-pretty">
                  Controle lotes, cultivos, custos e lucratividade em uma plataforma feita para o produtor rural.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: TrendingUp,
                    title: "Lucratividade em tempo real",
                    desc: "Acompanhe lucro, receita e custos por lote",
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics de performance",
                    desc: "Graficos comparativos para decisoes rapidas",
                  },
                  {
                    icon: Shield,
                    title: "Rastreabilidade completa",
                    desc: "Hash de verificacao e timeline de eventos",
                  },
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

            {/* Right Side - Login Form */}
            <Card className="p-8 shadow-2xl border-border/50 bg-card/95 backdrop-blur-md">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Entrar</h2>
                  <p className="text-sm text-muted-foreground">Acesse o painel da sua fazenda</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-muted-foreground">Lembrar de mim</span>
                    </label>
                    <a href="#" className="text-primary hover:underline font-medium">
                      Esqueceu a senha?
                    </a>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Entrar no painel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Ainda nao tem conta?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Cadastre-se gratuitamente
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tudo que voce precisa para gerenciar sua producao
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Verdantis oferece ferramentas completas para acompanhar cada etapa da sua producao agricola
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Grid3x3,
                title: "Gestao de Lotes",
                description: "Cadastre e gerencie todos os seus lotes com informacoes detalhadas de producao e custos",
              },
              {
                icon: Sprout,
                title: "Controle de Cultivos",
                description: "Acompanhe o ciclo completo de cada cultivo com rastreabilidade de eventos",
              },
              {
                icon: LineChart,
                title: "Simulacoes",
                description: "Projete cenarios e compare resultados para tomar decisoes mais assertivas",
              },
              {
                icon: BarChart3,
                title: "Analytics Avancado",
                description: "Visualize graficos e metricas para entender a performance da sua fazenda",
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Pronto para modernizar sua gestao agricola?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Comece agora e tenha controle total sobre sua producao
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Comecar Agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Verdantis</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2025 Verdantis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
