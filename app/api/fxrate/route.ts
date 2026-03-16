import { NextResponse } from 'next/server'

const ER_API_URL = 'https://open.er-api.com/v6/latest/USD'

export async function GET() {
  try {
    const res = await fetch(ER_API_URL, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json({ error: '환율 로드 실패' }, { status: 502 })

    const json = await res.json()
    if (json.result !== 'success') return NextResponse.json({ error: '파싱 실패' }, { status: 502 })

    return NextResponse.json({
      rate: json.rates?.KRW as number,
      updatedAt: json.time_last_update_utc
        ? new Date(json.time_last_update_utc as string).toISOString()
        : '',
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
