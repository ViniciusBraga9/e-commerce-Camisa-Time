import { Link } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { GradeProdutos, Ligas } from '../components/Vitrine'
import Icone from '../components/Icone'

export default function Home() {
  const { banco } = useLoja()
  return (
    <>
      <section className="hero" aria-labelledby="capa-titulo">
        <div className="hero-estadio" aria-hidden="true" />
        <div className="hero-pelicula" aria-hidden="true" />
        <div className="container hero-dentro">
          <div className="hero-texto">
            <span className="editoria">
              <i />
              Coleção retrô
            </span>
            <h1 id="capa-titulo">
              VASCO <em>1998.</em>
            </h1>
            <p>A faixa preta, a cruz no peito e a camisa que marcou uma geração.</p>
            <Link
              className="botao botao-laranja"
              to={
                banco.produtos.some((produto) => produto.id === 'vasco')
                  ? '/produtos/vasco'
                  : '/produtos?modelo=Retr%C3%B4'
              }
            >
              Ver coleção <Icone nome="seta" />
            </Link>
          </div>
          <div className="hero-retrato">
            <img
              src="/marca/vasco-banner.webp"
              alt="Camisa branca retrô do Vasco com faixa preta e cruz vermelha"
              fetchPriority="high"
            />
          </div>
          <div className="legenda-hero">
            <span />
            São Januário · Rio de Janeiro
          </div>
        </div>
      </section>
      <div className="container inicio-conteudo">
        <section className="secao-ligas">
          <h2>Explore por liga</h2>
          <Ligas />
        </section>
        <section className="destaques">
          <div className="titulo-linha">
            <h2>Destaques da loja</h2>
            <Link className="link-seta" to="/produtos">
              Ver catálogo <Icone nome="seta" tamanho={17} />
            </Link>
          </div>
          <GradeProdutos produtos={banco.produtos.slice(0, 4)} />
        </section>
      </div>
    </>
  )
}
