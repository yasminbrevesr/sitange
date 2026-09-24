import Link from "next/link";

// Meus pedidos: ainda não há checkout, então a lista fica vazia.
export default function MeusPedidosPage() {
  return (
    <div>
      <h1 className="display text-[34px] md:text-[40px]">Meus pedidos</h1>
      <div className="mt-8 flex flex-col items-start gap-5 bg-creme-claro p-8">
        <p className="text-[15px] text-tinta/80">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/#as-pecas"
          className="rotulo inline-flex min-h-12 items-center rounded-full bg-verde px-8 text-[11px] text-creme-claro hover:bg-verde-claro"
        >
          Ver as quatro peças
        </Link>
      </div>
    </div>
  );
}
