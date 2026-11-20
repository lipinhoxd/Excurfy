import { Badge, type StatusBadge } from "./Badge";

type Props = {
  titulo: string;
  data: string;
  local?: string;
  preco: string; // já formatado, ex.: "R$ 120,00"
  vagas?: string;
  status?: StatusBadge;
  href?: string;
};

export function ExcursionCard({ titulo, data, local, preco, vagas, status, href }: Props) {
  const conteudo = (
    <>
      <div className="card__topo">
        <h3 className="card__titulo">{titulo}</h3>
        {status && <Badge status={status} />}
      </div>
      <p className="card__meta">{[data, local].filter(Boolean).join(" · ")}</p>
      {vagas && <p className="card__meta">{vagas}</p>}
      <div className="card__rodape">
        <span className="card__preco">{preco}</span>
        {href && <span className="link">Ver excursão</span>}
      </div>
    </>
  );

  return href ? (
    <a href={href} className="card" style={{ textDecoration: "none", color: "inherit" }}>{conteudo}</a>
  ) : (
    <article className="card">{conteudo}</article>
  );
}
