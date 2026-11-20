import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  ajuda?: string;
  erro?: string;
};

export function Input({ label, ajuda, erro, className, ...rest }: InputProps) {
  const id = useId();
  const ajudaId = ajuda ? `${id}-ajuda` : undefined;
  const erroId = erro ? `${id}-erro` : undefined;
  const descrito = [ajudaId, erroId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["field", erro && "field--erro", className].filter(Boolean).join(" ")}>
      <label className="field__label" htmlFor={id}>{label}</label>
      <input className="field__input" id={id} aria-invalid={erro ? true : undefined} aria-describedby={descrito} {...rest} />
      {ajuda && <span className="field__ajuda" id={ajudaId}>{ajuda}</span>}
      {erro && <span className="field__erro" id={erroId} role="alert">{erro}</span>}
    </div>
  );
}
