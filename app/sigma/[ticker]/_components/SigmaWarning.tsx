const SigmaWarning = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
    <p className="text-[12px] text-amber-500 leading-relaxed">{message}</p>
  </div>
)

export default SigmaWarning
