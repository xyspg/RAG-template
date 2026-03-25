import {NextRequest} from "next/server";
import {getStringFromBuffer, ResultCode} from "@/lib/utils";
import {client} from "@/app/db";
import {auth} from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  const result = await client.query('SELECT role FROM users WHERE id = $1', [session.user?.id]);
  const role = result.rows[0]?.role;
  if (role !== 'admin' && role !== 'super_admin') return null;
  return session;
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const id = request.nextUrl.searchParams.get('id')
  const password = '123456'

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
  } catch (e) {
    console.error(e);
    return new Response("Internal server error", {status: 500})
  }

  return new Response('ok')
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const id = request.nextUrl.searchParams.get('id')
  const query = 'DELETE FROM users WHERE id = $1'
  try {
    await client.query(query, [id])
  } catch (e) {
    console.error(e);
    return new Response("Internal server error", {status: 500})
  }
  return new Response('ok')

}