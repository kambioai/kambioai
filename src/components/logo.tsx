import { cn } from "@/lib/utils";

/**
 * Logo do Kambio: quadrado marinho arredondado com "K" branco (Space Grotesk)
 * e um ponto laranja no canto. Opcionalmente com o nome ao lado.
 */
export function Logo({
  tamanho = 40,
  comNome = false,
  className,
}: {
  tamanho?: number;
  comNome?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative grid place-items-center rounded-[22%] bg-principal"
        style={{ width: tamanho, height: tamanho }}
        aria-hidden="true"
      >
        <span
          className="font-grotesk font-bold leading-none text-white"
          style={{ fontSize: tamanho * 0.56 }}
        >
          K
        </span>
        <span
          className="absolute rounded-full bg-destaque"
          style={{
            width: tamanho * 0.16,
            height: tamanho * 0.16,
            top: tamanho * 0.16,
            right: tamanho * 0.16,
          }}
        />
      </div>
      {comNome && (
        <span
          className="font-grotesk font-bold text-principal"
          style={{ fontSize: tamanho * 0.6 }}
        >
          Kambio
        </span>
      )}
    </div>
  );
}
