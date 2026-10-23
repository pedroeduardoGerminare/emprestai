"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightIcon, PackageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export function LoginPage() {
  const [notice, setNotice] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <main data-screen-label="01 Login" className="grid min-h-screen grid-cols-1 bg-bg lg:min-h-[max(820px,100svh)] lg:grid-cols-[560px_1fr]">
      <section aria-label="EmpresTI" className="login-hero flex flex-col justify-between gap-14 px-8 py-10 lg:p-14">
        <div className="flex items-center gap-[10px] text-base font-semibold tracking-[.02em]">
          <span className="grid size-[34px] place-items-center rounded-control bg-accent-900 text-accent-400 ring-1 ring-accent-700">
            <PackageIcon size={18} aria-hidden="true" />
          </span>
          EmpresTI
        </div>

        <div className="flex max-w-[390px] flex-col gap-[22px]">
          <h1 className="max-w-[20ch] text-[34px] leading-[1.15] font-semibold tracking-[-.01em]">Quem está com o quê</h1>
          <p className="max-w-[38ch] text-sm leading-[1.55] text-[#93A0C6]">Pedido e devolução sem planilha.</p>
          <div aria-hidden="true" className="brand-rule h-px w-full" />
          <dl className="flex gap-10">
            <div className="flex flex-col gap-[3px]"><dt className="order-2 text-[11.5px] text-text-dim">itens por pessoa</dt><dd className="text-2xl font-semibold">3</dd></div>
            <div className="flex flex-col gap-[3px]"><dt className="order-2 text-[11.5px] text-text-dim">dias de prazo</dt><dd className="text-2xl font-semibold">14</dd></div>
          </dl>
        </div>

        <p className="text-[11px] text-text-faint">Operações · v1</p>
      </section>

      <section aria-labelledby="login-title" className="grid place-items-center px-8 py-14 lg:p-14">
        <form noValidate onSubmit={handleSubmit(() => setNotice("O acesso será liberado após a configuração dos convites."))} className="flex w-full max-w-[372px] flex-col gap-[22px]">
          <div className="flex flex-col gap-2">
            <h2 id="login-title" className="text-[22px] leading-[1.2] font-semibold">Entrar</h2>
            <p className="text-[13px] text-text-dim">E-mail e senha do convite.</p>
          </div>

          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="email" className="text-xs text-neutral-400">E-mail</label>
              <Input id="email" type="email" autoComplete="username" placeholder="nome@empresa.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
              {errors.email && <p id="email-error" role="alert" className="text-xs text-overdue">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="password" className="text-xs text-neutral-400">Senha</label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} />
              {errors.password && <p id="password-error" role="alert" className="text-xs text-overdue">{errors.password.message}</p>}
            </div>
          </div>

          <Button type="submit" variant="primary" size="form" className="w-full justify-between">Entrar<ArrowRightIcon size={16} aria-hidden="true" /></Button>
          <div className="flex flex-col gap-[18px]">
            <div aria-hidden="true" className="support-rule h-px w-full" />
            <p className="text-center text-xs text-text-faint">Sem acesso? Fale com Operações.</p>
          </div>
          <p role="status" aria-live="polite" className="text-center text-xs leading-relaxed text-text-muted">{notice || "Prévia da página de acesso."}</p>
        </form>
      </section>
    </main>
  );
}
