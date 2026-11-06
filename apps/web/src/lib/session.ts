const KEYS = {
  token: "token",
  userId: "userId",
  userName: "userName",
  userEmail: "userEmail",
} as const

export type SessionUser = {
  id?: number | string
  name?: string
  email?: string
}

const isBrowser = () => typeof window !== "undefined"

export function saveSession(token: string, user: SessionUser) {
  if (!isBrowser()) return
  localStorage.setItem(KEYS.token, token)
  if (user.id !== undefined) localStorage.setItem(KEYS.userId, String(user.id))
  if (user.name) localStorage.setItem(KEYS.userName, user.name)
  if (user.email) localStorage.setItem(KEYS.userEmail, user.email)
}

export function clearSession() {
  if (!isBrowser()) return
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}

export function getToken(): string | null {
  return isBrowser() ? localStorage.getItem(KEYS.token) : null
}

export function getSessionUser(): SessionUser {
  if (!isBrowser()) return {}
  return {
    id: localStorage.getItem(KEYS.userId) ?? undefined,
    name: localStorage.getItem(KEYS.userName) ?? undefined,
    email: localStorage.getItem(KEYS.userEmail) ?? undefined,
  }
}
