'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }
  return <AuthLayout mode="login"><p className="eyebrow">Welcome back</p><h2 className="display mt-4 text-6xl">Sign in to your account.</h2><p className="mt-5 text-sm leading-7 text-ink/60">Access saved pieces and continue your lighting conversation with us.</p>{submitted ? <Success /> : <form onSubmit={submit} className="mt-9 space-y-5"><Field label="Email address" name="email" type="email"/><label className="block text-xs font-bold uppercase tracking-[.12em]">Password<div className="mt-2 flex border-b border-ink/30"><input required name="password" type={showPassword ? 'text' : 'password'} className="w-full bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none"/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="px-2 text-ink/50">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label><div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-ink/60"><input type="checkbox" className="accent-champagne"/> Remember me</label><Link href="/forgot-password" className="font-bold text-champagne">Forgot password?</Link></div><button className="button-gold mt-3 w-full" type="submit">Sign in <ArrowRight size={15}/></button></form>}</AuthLayout>;
}
function Field({ label, name, type }: { label:string; name:string; type:string }) { return <label className="block text-xs font-bold uppercase tracking-[.12em]">{label}<input required name={name} type={type} className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none"/></label>; }
function Success() { return <div className="mt-9 border border-champagne/30 bg-[#efe8dc] p-5 text-sm leading-6 text-ink/70">Authentication is ready for your backend connection. Add your auth provider in the form submit handler to enable sign-in.</div>; }
