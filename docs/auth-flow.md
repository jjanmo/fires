# 인증 플로우

## 기술 스택

- **Supabase Auth** — 인증 서버 (JWT 발급·갱신)
- **@supabase/ssr** — Next.js App Router SSR 지원
- **Next.js Middleware** — 라우트 보호 및 세션 자동 갱신

---

## 회원가입

```
사용자 → /login (회원가입 탭)
  → 이메일·비밀번호 입력 후 제출
  → Server Action: signUp()
  → Supabase.auth.signUp()
  → 성공 시 redirect('/')
```

- 이메일 인증 없음 (Supabase 대시보드에서 비활성화)
- 비밀번호 최소 6자

---

## 로그인

```
사용자 → /login (로그인 탭)
  → 이메일·비밀번호 입력 후 제출
  → Server Action: signIn()
  → Supabase.auth.signInWithPassword()
  → 성공 시 redirect('/')
```

---

## 자동 로그인 (토큰 갱신)

```
모든 요청
  → middleware.ts 실행
  → updateSession() 호출
  → Supabase가 Access Token 만료 확인
  → 만료 시 Refresh Token으로 자동 갱신
  → 갱신된 토큰을 쿠키에 저장
```

| 토큰 | 수명 |
|------|------|
| Access Token (JWT) | 1시간 |
| Refresh Token | 무제한 (기본값) |

Refresh Token이 유효한 한 재로그인 불필요.

---

## 라우트 보호

`middleware.ts`가 모든 요청을 가로채 인증 상태를 확인합니다.

| 상태 | 경로 | 처리 |
|------|------|------|
| 미인증 | `/` 등 일반 페이지 | `/login` 리다이렉트 |
| 인증됨 | `/login` | `/` 리다이렉트 |
| 제외 | `/_next/**`, 이미지 등 정적 자산 | 검사 없이 통과 |

---

## 로그아웃

```
사용자 → 헤더 아바타 클릭 → 로그아웃 버튼
  → Server Action: signOut()
  → Supabase.auth.signOut()
  → 쿠키의 토큰 삭제
  → redirect('/login')
```

---

## 파일 구조

```
features/auth/
  actions.ts          # Server Actions (signIn, signUp, signOut)
  ui/LoginForm.tsx    # 로그인·회원가입 폼 (탭 전환)
  ui/UserMenu.tsx     # 헤더 아바타 드롭다운

shared/lib/supabase/
  client.ts           # 브라우저용 클라이언트
  server.ts           # 서버 컴포넌트·Server Action용
  middleware.ts       # 미들웨어용 세션 갱신 로직

app/
  login/page.tsx      # 로그인 페이지
  layout.tsx          # 헤더에 UserMenu 마운트

middleware.ts         # 전역 라우트 보호
```

---

## 에러 메시지 한글 매핑

| Supabase 원문 | 표시 메시지 |
|---|---|
| Invalid login credentials | 이메일 또는 비밀번호가 올바르지 않습니다 |
| Email not confirmed | 이메일 인증이 필요합니다. 메일함을 확인해주세요 |
| User already registered | 이미 가입된 이메일입니다 |
| Password should be at least 6 characters | 비밀번호는 최소 6자 이상이어야 합니다 |
| Email rate limit exceeded | 잠시 후 다시 시도해주세요 |
