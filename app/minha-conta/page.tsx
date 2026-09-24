import Link from "next/link";

// Meus pedidos: ainda não há checkout, então a lista fica vazia.
export default function MeusPedidosPage() {
  return (
    <div>
      <h1 className="display text-[38px] text-verde md:text-[46px]">
        Meus pedidos
        <span className="text-laranja" aria-hidden="true">.</span>
      </h1>
      <div className="mt-8 flex flex-col items-start gap-5 bg-verde p-8 text-creme-claro md:p-10">
        <p className="text-[18px] font-light">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/#as-pecas"
          className="rotulo inline-flex min-h-12 items-center rounded-full bg-laranja px-8 text-[11px] text-tinta hover:bg-creme-claro"
        >
          Ver as quatro peças
        </Link>
      </div>
    </div>
  );
}
