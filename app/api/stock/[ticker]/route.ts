import { NextResponse } from 'next/server'
import { fetchCloses } from '@/entities/sigma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params

  try {
    const closes = await fetchCloses(ticker)
    return NextResponse.json({ closes })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
