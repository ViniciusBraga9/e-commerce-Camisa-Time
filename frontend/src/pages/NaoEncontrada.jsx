import { Link } from 'react-router-dom'
import Icone from '../components/Icone'

export default function NaoEncontrada({ titulo = 'Página não encontrada' }) {
  return (
    <div className="container pagina pagina-estado">
      <span className="rotulo">404</span>
      <h1>{titulo}</h1>
      <p>Você pode continuar pela vitrine da Camisa10.</p>
      <Link className="botao" to="/produtos">
        Ir para o catálogo <Icone nome="seta" />
      </Link>
    </div>
  )
}
