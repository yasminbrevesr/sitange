import { OrdersList } from "@/components/conta/OrdersList";

export default function MeusPedidosPage() {
  return (
    <div>
      <h1 className="display text-[38px] text-verde md:text-[46px]">
        Meus pedidos
        <span className="text-laranja" aria-hidden="true">.</span>
      </h1>
      <OrdersList />
    </div>
  );
}
