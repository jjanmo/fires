export const APP_ERROR_CODE = {
  SYMBOL_NOT_FOUND: 'SYMBOL_NOT_FOUND', // 존재하지 않는 심볼
  FETCH_FAILED: 'FETCH_FAILED',         // Yahoo Finance 네트워크/서버 오류
} as const

export type AppErrorCode = (typeof APP_ERROR_CODE)[keyof typeof APP_ERROR_CODE]

export class AppError extends Error {
  constructor(public readonly code: AppErrorCode) {
    super(code)
    this.name = 'AppError'
  }
}
