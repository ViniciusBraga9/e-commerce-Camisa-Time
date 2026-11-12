import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { Campo, Erro } from '../../components/Interface'
import { esperar } from '../../services/banco'
import { salvarProduto, TAMANHOS, validarProduto } from '../../services/administracao'
import { produtosIniciais } from '../../data/catalogo'
import NaoEncontrada from '../NaoEncontrada'

function Formulario({ produto }) {
  const { banco, alterar } = useLoja()
  const navegar = useNavigate()
  const [form, setForm] = useState({
    time: produto?.time || '',
    modelo: produto?.modelo || '',
    temporada: produto?.temporada || '',
    liga: produto?.liga || '',
    preco: produto ? (produto.preco / 100).toFixed(2) : '',
    imagem: produto?.imagem || '',
    descricao: produto?.descricao || '',
    estoque: produto ? { ...produto.estoque } : { P: 0, M: 0, G: 0, GG: 0 },
  })
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [imagemFalhou, setImagemFalhou] = useState(false)

  function mudar(nome, valor) {
    setForm({ ...form, [nome]: valor })
    setErros({ ...erros, [nome]: '' })
    setErro('')
    if (nome === 'imagem') setImagemFalhou(false)
  }

  function mudarEstoque(nome, valor) {
    const tamanho = nome.replace('estoque-', '')
    setForm({ ...form, estoque: { ...form.estoque, [tamanho]: valor } })
    setErros({ ...erros, [nome]: '' })
    setErro('')
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return
    const novos = validarProduto(form, banco.categorias)
    setErros(novos)
    if (Object.keys(novos).length) {
      document.getElementById(Object.keys(novos)[0])?.focus()
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await esperar()
      alterar((dados) => salvarProduto(dados, form, produto?.id))
      navegar('/admin/produtos', {
        state: { aviso: produto ? 'Camisa atualizada.' : 'Camisa cadastrada.' },
      })
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="admin-titulo">
        <div>
          <h1>{produto ? 'Editar camisa' : 'Nova camisa'}</h1>
          <p className="suave">Preencha os dados do produto e as unidades disponíveis.</p>
        </div>
        <Link className="link" to="/admin/produtos">
          Voltar aos produtos
        </Link>
      </div>
      {banco.categorias.length === 0 && (
        <p className="alerta">
          Cadastre uma categoria antes de adicionar camisas.{' '}
          <Link className="link" to="/admin/categorias">
            Gerenciar categorias
          </Link>
        </p>
      )}
      <form className="admin-formulario" onSubmit={salvar} noValidate>
        <div className="blocos">
          <fieldset className="bloco-form" disabled={salvando}>
            <legend>Informações da camisa</legend>
            <div className="admin-campos">
              <Campo
                nome="time"
                rotulo="Time ou seleção"
                valor={form.time}
                mudar={mudar}
                erro={erros.time}
                maxLength={80}
                required
              />
              <div className="campo">
                <label htmlFor="liga">Categoria</label>
                <select
                  id="liga"
                  value={form.liga}
                  onChange={(evento) => mudar('liga', evento.target.value)}
                  aria-invalid={Boolean(erros.liga)}
                  aria-describedby={erros.liga ? 'liga-erro' : undefined}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {banco.categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                {erros.liga && (
                  <small id="liga-erro" role="alert">
                    {erros.liga}
                  </small>
                )}
              </div>
              <Campo
                nome="modelo"
                rotulo="Modelo"
                valor={form.modelo}
                mudar={mudar}
                erro={erros.modelo}
                placeholder="Titular, Visitante, Retrô…"
                list="modelos"
                maxLength={40}
                required
              />
              <datalist id="modelos">
                {['Titular', 'Visitante', 'Retrô', 'Casual'].map((modelo) => (
                  <option key={modelo} value={modelo} />
                ))}
              </datalist>
              <Campo
                nome="temporada"
                rotulo="Temporada ou edição"
                valor={form.temporada}
                mudar={mudar}
                erro={erros.temporada}
                placeholder="2026, 25/26, 1998…"
                maxLength={40}
                required
              />
              <Campo
                nome="preco"
                rotulo="Preço (R$)"
                tipo="number"
                valor={form.preco}
                mudar={mudar}
                erro={erros.preco}
                min="0.01"
                max="99999.99"
                step="0.01"
                required
              />
              <div className="campo admin-campo-inteiro">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(evento) => mudar('descricao', evento.target.value)}
                  rows="4"
                  maxLength={1000}
                  aria-invalid={Boolean(erros.descricao)}
                  aria-describedby={erros.descricao ? 'descricao-erro' : undefined}
                  required
                />
                {erros.descricao && (
                  <small id="descricao-erro" role="alert">
                    {erros.descricao}
                  </small>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset className="bloco-form" disabled={salvando}>
            <legend>Estoque por tamanho</legend>
            <p className="suave">Use zero para marcar um tamanho como esgotado.</p>
            <div className="admin-estoque">
              {TAMANHOS.map((tamanho) => (
                <Campo
                  key={tamanho}
                  nome={'estoque-' + tamanho}
                  rotulo={'Tamanho ' + tamanho}
                  tipo="number"
                  valor={form.estoque[tamanho]}
                  mudar={mudarEstoque}
                  erro={erros['estoque-' + tamanho]}
                  min="0"
                  max="9999"
                  step="1"
                  required
                />
              ))}
            </div>
          </fieldset>
        </div>
        <fieldset className="bloco-form admin-foto-form" disabled={salvando}>
          <legend>Foto do produto</legend>
          <div className="admin-previa-foto">
            {form.imagem && !imagemFalhou ? (
              <img
                src={form.imagem}
                alt="Prévia da camisa"
                onError={() => setImagemFalhou(true)}
              />
            ) : (
              <span>
                {imagemFalhou
                  ? 'Não foi possível abrir esta imagem.'
                  : 'A foto da camisa aparecerá aqui.'}
              </span>
            )}
          </div>
          <div className="campo">
            <label htmlFor="foto-exemplo">Fotos disponíveis</label>
            <select
              id="foto-exemplo"
              value={
                produtosIniciais.some((item) => item.imagem === form.imagem)
                  ? form.imagem
                  : ''
              }
              onChange={(evento) => mudar('imagem', evento.target.value)}
            >
              <option value="">Escolha uma foto ou informe o caminho abaixo</option>
              {produtosIniciais.map((item) => (
                <option key={item.id} value={item.imagem}>
                  {item.time} · {item.modelo} · {item.temporada}
                </option>
              ))}
            </select>
          </div>
          <Campo
            nome="imagem"
            rotulo="Caminho ou URL da imagem"
            valor={form.imagem}
            mudar={mudar}
            erro={erros.imagem}
            placeholder="/camisas/vasco.webp"
            maxLength={1000}
            required
          />
          <p className="suave">
            Você também pode colocar uma foto na pasta public/camisas e informar o caminho
            acima.
          </p>
        </fieldset>
        <div className="admin-form-rodape">
          <Erro>{erro}</Erro>
          <div className="acoes">
            <button
              className="botao botao-laranja"
              disabled={salvando || !banco.categorias.length}
            >
              {salvando ? 'Salvando…' : 'Salvar camisa'}
            </button>
            <Link className="link" to="/admin/produtos">
              Cancelar
            </Link>
          </div>
          {salvando && (
            <span className="suave" role="status">
              Salvando a camisa…
            </span>
          )}
        </div>
      </form>
    </>
  )
}

export default function ProdutoForm() {
  const { id } = useParams()
  const { banco } = useLoja()
  const produto = banco.produtos.find((item) => item.id === id)
  if (id && !produto) return <NaoEncontrada titulo="Camisa não encontrada" />
  // A chave reinicia os campos ao trocar entre cadastro e edição.
  return <Formulario key={id || 'novo'} produto={produto} />
}
