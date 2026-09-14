import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  return NextResponse.json(auth.profile)
}
