"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Campo de senha com botão para revelar o que foi digitado.
 *
 * O público são professores, muitos digitando no celular numa sala
 * barulhenta: errar a senha sem poder conferir é a causa mais comum de
 * abandono no login. O botão fica DENTRO do campo, à direita, com alvo
 * de toque de 44px.
 *
 * Funciona controlado (com `value` e `onChange`) ou não controlado
 * (com `name`, em formulários de Server Action) — os dois padrões
 * existem neste projeto.
 */

type Props = {
  id?: string;
  name?: string;
  rotulo: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  /** Conteúdo extra abaixo do campo (medidor de força, dica, etc.) */
  children?: React.ReactNode;
};

export function CampoSenha({
  id,
  name,
  rotulo,
  value,
  onChange,
  autoComplete = "current-password",
  placeholder,
  required,
  minLength,
  children,
}: Props) {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const [visivel, setVisivel] = useState(false);

  return (
    <div>
      <label htmlFor={idCampo} className="mb-1.5 block font-titulo text-sm font-bold">
        {rotulo}
      </label>

      <div className="relative">
        <input
          id={idCampo}
          name={name}
          type={visivel ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="campo campo-com-acao"
        />

        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          // O rótulo diz a AÇÃO, não o estado: é o que o leitor de tela
          // anuncia quando o usuário chega ao botão.
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-cinza transition-colors hover:text-indigo"
        >
          {visivel ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {children}
    </div>
  );
}
