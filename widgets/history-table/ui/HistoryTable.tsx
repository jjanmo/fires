import type { HistoryRow } from '@/entities/sigma';
import { formatPrice } from '@/shared/lib/ticker';

interface Props {
  rows: HistoryRow[];
  symbol: string;
}

export default function HistoryTable({ rows, symbol }: Props) {
  return (
    <div className="rounded-2xl bg-card border border-edge overflow-hidden">
      <div className="px-5 py-4 border-b border-edge">
        <p className="text-[11px] text-ink-3 uppercase tracking-widest">히스토리 (최근 30일)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-ink-4 uppercase tracking-wider border-b border-edge">
              <th className="px-4 py-3 text-left font-medium">날짜</th>
              <th className="px-3 py-3 text-right font-medium">시가</th>
              <th className="px-3 py-3 text-right font-medium text-sell-val">고가</th>
              <th className="px-3 py-3 text-right font-medium text-buy-val">저가</th>
              <th className="px-3 py-3 text-right font-medium">종가</th>
              <th className="px-3 py-3 text-right font-medium">등락률</th>
              <th className="px-3 py-3 text-right font-medium text-buy-val">
                1<span className="normal-case">σ</span> 매수가
              </th>
              <th className="px-3 py-3 text-right font-medium text-buy-val">
                2<span className="normal-case">σ</span> 매수가
              </th>
              <th className="px-3 py-3 text-right font-medium text-sell-val">
                1<span className="normal-case">σ</span> 매도가
              </th>
              <th className="px-3 py-3 text-right font-medium text-sell-val">
                2<span className="normal-case">σ</span> 매도가
              </th>
              <th className="px-4 py-3 text-right font-medium">신호</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isBuy  = row.triggered === 'buy-1s' || row.triggered === 'buy-2s';
              const isSell = row.triggered === 'sell-2s' || row.triggered === 'sell-1s';
              return (
                <tr
                  key={`${row.date}-${index}`}
                  className={`border-t border-edge transition-colors hover:bg-row-hover ${
                    isBuy ? 'bg-buy-bg' : isSell ? 'bg-sell-bg' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-ink-3 text-[11px] whitespace-nowrap">{row.date}</td>

                  {/* 시가 */}
                  <td className="px-3 py-2.5 text-right font-mono text-ink-2 tabular-nums text-[12px]">
                    {formatPrice(row.open, symbol)}
                  </td>

                  {/* 고가 */}
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums text-[12px] ${
                      isSell ? 'text-sell-val font-semibold' : 'text-ink-2'
                    }`}
                  >
                    {formatPrice(row.high, symbol)}
                  </td>

                  {/* 저가 */}
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums text-[12px] ${
                      isBuy ? 'text-buy-val font-semibold' : 'text-ink-2'
                    }`}
                  >
                    {formatPrice(row.low, symbol)}
                  </td>

                  {/* 종가 */}
                  <td className="px-3 py-2.5 text-right font-mono text-ink-1 tabular-nums text-[12px] font-medium">
                    {formatPrice(row.close, symbol)}
                  </td>

                  {/* 등락률 */}
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums text-[11px] ${
                      row.actualReturn == null ? 'text-ink-4' : row.actualReturn >= 0 ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {row.actualReturn != null
                      ? `${row.actualReturn >= 0 ? '+' : ''}${row.actualReturn.toFixed(2)}%`
                      : '—'}
                  </td>

                  {/* 1σ 매수가 */}
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums text-[12px] ${
                    row.triggered === 'buy-1s' ? 'text-buy-val font-semibold' : 'text-buy-text'
                  }`}>
                    {formatPrice(row.s1BuyPrice, symbol)}
                  </td>

                  {/* 2σ 매수가 */}
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums text-[12px] ${
                      row.triggered === 'buy-2s' ? 'text-buy-val font-semibold' : 'text-buy-text'
                    }`}
                  >
                    {formatPrice(row.buyPrice, symbol)}
                  </td>

                  {/* 1σ 매도가 */}
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[12px] text-sell-text">
                    {formatPrice(row.s1SellPrice, symbol)}
                  </td>

                  {/* 2σ 매도가 */}
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums text-[12px] ${
                      row.triggered === 'sell-2s' ? 'text-sell-val font-semibold' : 'text-sell-text'
                    }`}
                  >
                    {formatPrice(row.sellPrice, symbol)}
                  </td>

                  {/* 신호 배지 */}
                  <td className="px-4 py-2.5 text-right">
                    {row.triggered === 'buy-1s' && (
                      <span className="text-[10px] font-semibold text-buy-text bg-buy-badge border border-buy-edge px-2 py-0.5 rounded-full whitespace-nowrap">
                        1σ 매수
                      </span>
                    )}
                    {row.triggered === 'buy-2s' && (
                      <span className="text-[10px] font-semibold text-buy-text bg-buy-badge border border-buy-edge px-2 py-0.5 rounded-full whitespace-nowrap">
                        2σ 매수
                      </span>
                    )}
                    {row.triggered === 'sell-1s' && (
                      <span className="text-[10px] font-semibold text-sell-text bg-sell-badge border border-sell-edge px-2 py-0.5 rounded-full whitespace-nowrap">
                        1σ 매도
                      </span>
                    )}
                    {row.triggered === 'sell-2s' && (
                      <span className="text-[10px] font-semibold text-sell-text bg-sell-badge border border-sell-edge px-2 py-0.5 rounded-full whitespace-nowrap">
                        2σ 매도
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
