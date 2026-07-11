'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <AuthLayout mode="login"><p className="eyebrow">Account recovery</p><h2 className="display mt-4 text-6xl">Reset your password.</h2><p className="mt-5 text-sm leading-7 text-ink/60">Enter your email address and we will send a secure reset link once authentication is connected.</p>{sent ? <div className="mt-9 border border-champagne/30 bg-[#efe8dc] p-5 text-sm leading-6 text-ink/70">Reset request received. Connect this form to your email provider when the auth backend is enabled.</div> : <form onSubmit={submit} className="mt-9"><label className="block text-xs font-bold uppercase tracking-[.12em]">Email address<input required type="email" className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none"/></label><button className="button-gold mt-7 w-full" type="submit">Send reset link <ArrowRight size={15}/></button></form>}</AuthLayout>;
}
