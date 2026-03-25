import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/siteConfig";
import { SignJWT, jwtVerify } from "jose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN',
  InvalidEmailDomain = 'INVALID_EMAIL_DOMAIN',
  UserUpdated = 'USER_UPDATED'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return '用户名或密码错误'
    case ResultCode.InvalidSubmission:
      return '输入不合法，请重试'
    case ResultCode.UserAlreadyExists:
      return '用户已存在，请登录'
    case ResultCode.UserCreated:
      return '注册成功，欢迎！'
    case ResultCode.UnknownError:
      return '出了一些问题，请稍后重试'
    case ResultCode.UserLoggedIn:
      return '登录成功'
    case ResultCode.InvalidEmailDomain:
      return `邮箱后缀不被支持（请使用 ${siteConfig.emailDomain.join('/')}）`
  }
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

export function decodeBase64(base64UrlSafeString: string) {
  let base64 = base64UrlSafeString.replace(/-/g, '+').replace(/_/g, '/');

  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const jsonPayload = Buffer.from(base64, 'base64').toString();

  return JSON.parse(jsonPayload);
}

export async function createJWT(session: Record<any, any>) {
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!)

  return new SignJWT({ user: session.user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(new Date(session.expires).getTime() / 1000))
    .sign(secretKey)
}

export async function verifyJWT(token: string) {
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!)

  const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] })
  return payload
}

export const stripHtml = (htmlString: string) => {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
};