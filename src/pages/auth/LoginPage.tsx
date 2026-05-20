import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell, Mail, Lock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth, signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/hooks/auth/useAuth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function LoginPage() {
  const { session } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  if (session) return <Navigate to="/dashboard" replace />

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await signInWithEmail(data.email, data.password)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await signUpWithEmail(data.email, data.password, data.fullName)
      toast({
        variant: 'success' as const,
        title: '¡Cuenta creada!',
        description: 'Revisa tu email para confirmar tu cuenta.',
      })
      setIsRegister(false)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error con Google',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
          <Dumbbell className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">GymNutricio</h1>
          <p className="text-sm text-muted-foreground">Tu compañero de fitness y nutrición</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-muted p-1">
          <button
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              !isRegister ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
            onClick={() => setIsRegister(false)}
          >
            Iniciar sesión
          </button>
          <button
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              isRegister ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
            onClick={() => setIsRegister(true)}
          >
            Registrarse
          </button>
        </div>

        {/* Login Form */}
        {!isRegister && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9"
                  {...loginForm.register('email')}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...loginForm.register('password')}
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
        )}

        {/* Register Form */}
        {isRegister && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Tu nombre"
                  className="pl-9"
                  {...registerForm.register('fullName')}
                />
              </div>
              {registerForm.formState.errors.fullName && (
                <p className="text-xs text-destructive">{registerForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9"
                  {...registerForm.register('email')}
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Mín. 6 caracteres"
                  className="pl-9"
                  {...registerForm.register('password')}
                />
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  className="pl-9"
                  {...registerForm.register('confirmPassword')}
                />
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear cuenta'}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o continúa con</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
      </div>
    </div>
  )
}
