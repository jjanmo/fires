const WatchlistEmpty = () => (
  <div className="rounded-2xl border border-dashed border-edge bg-card p-8 text-center">
    <p className="text-2xl mb-3">☆</p>
    <p className="text-sm font-medium text-ink-2 mb-1">아직 추가된 종목이 없습니다</p>
    <p className="text-xs text-ink-4 leading-relaxed">
      검색에서 종목을 찾은 뒤<br />
      상세 페이지 우측 상단의 ★ 버튼을 눌러 추가하세요
    </p>
  </div>
)

export default WatchlistEmpty
