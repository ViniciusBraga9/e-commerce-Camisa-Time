import Icone from './Icone'

export default function Paginacao({ pagina, paginas, mudar }) {
  if (paginas <= 1) return null
  return (
    <nav className="paginacao" aria-label="Páginas da lista">
      <button
        aria-label="Página anterior"
        disabled={pagina === 1}
        onClick={() => mudar(pagina - 1)}
      >
        <Icone nome="anterior" />
      </button>
      <span>
        Página {pagina} de {paginas}
      </span>
      <button
        aria-label="Próxima página"
        disabled={pagina === paginas}
        onClick={() => mudar(pagina + 1)}
      >
        <Icone nome="proximo" />
      </button>
    </nav>
  )
}
