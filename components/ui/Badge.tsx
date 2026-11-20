// Selos de status: sempre ponto + texto, nunca só cor.
const STATUS = {
  pago: { texto: "Pago", tom: "positivo" },
  embarque_confirmado: { texto: "Embarque confirmado", tom: "positivo" },
  parcela_a_vencer: { texto: "Parcela a vencer", tom: "aviso" },
  ultimas_vagas: { texto: "Últimas vagas", tom: "aviso" },
  atrasado: { texto: "Atrasado", tom: "perigo" },
} as const;

export type StatusBadge = keyof typeof STATUS;

export function Badge({ status }: { status: StatusBadge }) {
  const { texto, tom } = STATUS[status];
  return (
    <span className={`badge badge--${tom}`}>
      <span className="badge__ponto" aria-hidden="true" />
      {texto}
    </span>
  );
}
