import Link from 'next/link';

const LoginButton = () => (
  <Link
    href="/login"
    title="로그인"
    className="w-6 h-6 flex items-center justify-center rounded-full text-ink-4 hover:text-ink-1 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  </Link>
);

export default LoginButton;
