// Ícones de linha usados nos controles da loja.
const desenhos = {
  seta: 'M4 12h15m-6-6 6 6-6 6',
  diagonal: 'M6 18 18 6M7 6h11v11',
  anterior: 'm14 6-6 6 6 6',
  proximo: 'm9 6 6 6-6 6',
  busca: 'M20 20l-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  sacola: 'M5 7h14l1 14H4L5 7Zm4 1V6a3 3 0 0 1 6 0v2',
  pessoa: 'M4 21a8 8 0 0 1 16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  lixeira: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  menos: 'M5 12h14',
  mais: 'M5 12h14m-7-7v14',
  caixa: 'm3 7 9-5 9 5-9 5-9-5Zm0 0v10l9 5 9-5V7m-9 5v10M7 4.8l9 5',
  visto: 'm4 12 5 5L20 6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  fechar: 'm5 5 14 14m0-14L5 19',
  sair: 'M10 3H4v18h6m-1-9h12m-4-4 4 4-4 4',
  lapis: 'M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z',
  painel: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 5h2m3 0h2m-4-3v2m0 3v2',
}
export default function Icone({ nome, tamanho = 20 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={desenhos[nome]} />
    </svg>
  )
}
