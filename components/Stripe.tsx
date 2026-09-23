import { Fragment } from "react";

// Faixa laranja de 54px com itens separados por barra.
export function Stripe({ items }: { items: string[] }) {
  return (
    <div className="bg-laranja text-tinta">
      <ul className="mx-auto flex min-h-[54px] max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-3 md:gap-x-8">
        {items.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && (
              <li aria-hidden="true" className="text-[#12121266]">
                /
              </li>
            )}
            <li className="rotulo text-[10px] md:text-[11px]">{item}</li>
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
