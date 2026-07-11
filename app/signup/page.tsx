'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }
  return <AuthLayout mode="signup"><p className="eyebrow">Create your account</p><h2 className="display mt-4 text-6xl">Begin with a little inspiration.</h2><p className="mt-5 text-sm leading-7 text-ink/60">Create an account to save selections and receive a more personal project experience.</p>{submitted ? <div className="mt-9 border border-champagne/30 bg-[#efe8dc] p-5 text-sm leading-6 text-ink/70">Your account form is ready. Connect this submit handler to your preferred authentication service when the backend is added.</div> : <form onSubmit={submit} className="mt-9 grid gap-5 sm:grid-cols-2"><Field label="First name" name="firstName"/><Field label="Last name" name="lastName"/><div className="sm:col-span-2"><Field label="Email address" name="email" type="email"/></div><div className="sm:col-span-2"><Field label="Create password" name="password" type="password"/></div><label className="sm:col-span-2 flex gap-3 text-xs leading-5 text-ink/60"><input required type="checkbox" className="mt-1 accent-champagne"/>I agree to receive project communication and understand the privacy policy.</label><button className="button-gold mt-2 sm:col-span-2" type="submit">Create account <ArrowRight size={15}/></button></form>}</AuthLayout>;
}
function Field({ label, name, type='text' }: { label:string; name:string; type?:string }) { return <label className="block text-xs font-bold uppercase tracking-[.12em]">{label}<input required name={name} type={type} className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none"/></label>; }
