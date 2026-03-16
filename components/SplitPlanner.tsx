'use client'

import { useState } from 'react'

interface Props {
  buyPrice: number
  sellPrice: number
}

export default function SplitPlanner({ buyPrice, sellPrice }: Props) {
  const [totalKRW, setTotalKRW] = useState(2000)   // 만원 단위
  const [splits, setSplits] = useState(20)
  const [fxRate, setFxRate] = useState(1380)

  const perBuyKRW = (totalKRW * 10_000) / splits
  const perBuyUSD = perBuyKRW / fxRate
  const qtyAtBuy = Math.floor(perBuyUSD / buyPrice)
  const qtyAtSell = Math.floor(perBuyUSD / sellPrice)

  return (
    <div className="rounded-2xl bg-[#111318] border border-[#1e2128] p-5">
      <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-5">분할매수 계획기</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '배정금 (만원)', value: totalKRW, setter: setTotalKRW },
          { label: '분할 횟수', value: splits, setter: setSplits },
          { label: '환율 (원/$)', value: fxRate, setter: setFxRate },
        ].map(({ label, value, setter }) => (
          <label key={label} className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-500">{label}</span>
            <input
              type="number"
              value={value}
              onChange={e => setter(+e.target.value)}
              className="bg-[#1a1d24] border border-[#2d3340] rounded-lg px-3 py-2 text-white text-sm tabular-nums focus:outline-none focus:border-slate-500 transition-colors"
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1e2128]">
        <div>
          <p className="text-[11px] text-slate-600 mb-1">회당 투자금</p>
          <p className="text-base font-semibold text-white tabular-nums">
            {Math.round(perBuyKRW).toLocaleString()}원
          </p>
          <p className="text-[11px] text-slate-600 font-mono mt-0.5">
            ${perBuyUSD.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-600 mb-1">2σ 매수가 기준</p>
          <p className="text-base font-semibold text-green-400 tabular-nums">
            {qtyAtBuy}주
          </p>
          <p className="text-[11px] text-slate-600 font-mono mt-0.5">@ ${buyPrice}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-600 mb-1">2σ 매도가 기준</p>
          <p className="text-base font-semibold text-blue-400 tabular-nums">
            {qtyAtSell}주
          </p>
          <p className="text-[11px] text-slate-600 font-mono mt-0.5">@ ${sellPrice}</p>
        </div>
      </div>
    </div>
  )
}
