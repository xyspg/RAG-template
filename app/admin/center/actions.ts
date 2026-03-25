"use server"

import {getStringFromBuffer, ResultCode} from "@/lib/utils";
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {createUser} from "@/app/signup/actions";
import {client} from "@/app/db";

export const resetPassword = async (id: string) => {
  const password = 123456

  const salt = crypto.randomUUID()

  const encoder = new TextEncoder()
  const saltedPassword = encoder.encode(password + salt)
  const hashedPasswordBuffer = await crypto.subtle.digest(
    'SHA-256',
    saltedPassword
  )
  const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

  const query = 'UPDATE users SET password = $2, salt = $3 WHERE id = $1'
  try {
    const res = await client.query(query, [id, hashedPassword, salt])
    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    }
  } catch (e) {
    console.error(e);
    return {
      type: 'error',
      resultCode: ResultCode.UnknownError
    }
  }
}