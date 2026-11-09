import { usuarioAtual } from './banco'

export function exigirAdmin(banco) {
  const admin = usuarioAtual(banco)
  if (!admin || admin.perfil !== 'admin')
    throw new Error('Acesso restrito à administração.')
  return admin
}

function validarProduto({ id, time, modelo, temporada, liga, preco, estoque }) {
  if (!id.trim()) throw new Error('Informe o identificador do produto.')
  if (!/^[a-z0-9-]+$/.test(id.trim()))
    throw new Error('Use apenas letras minúsculas, números e hifens no identificador.')
  if (!time.trim()) throw new Error('Informe o nome do time.')
  if (!modelo.trim()) throw new Error('Informe o modelo.')
  if (!temporada.trim()) throw new Error('Informe a temporada.')
  if (!liga) throw new Error('Selecione uma categoria.')
  if (!Number.isInteger(preco) || preco <= 0) throw new Error('Informe um preço válido.')
  for (const tam of ['P', 'M', 'G', 'GG']) {
    if (!Number.isInteger(estoque[tam]) || estoque[tam] < 0)
      throw new Error(`Estoque ${tam} inválido.`)
  }
}

export function criarProduto(banco, dados) {
  exigirAdmin(banco)
  const { id, time, modelo, temporada, liga, preco, descricao, estoque } = dados
  validarProduto(dados)
  if (banco.produtos.some((p) => p.id === id.trim()))
    throw new Error('Já existe um produto com esse identificador.')
  banco.produtos.push({
    id: id.trim(),
    time: time.trim(),
    modelo: modelo.trim(),
    temporada: temporada.trim(),
    liga,
    preco,
    descricao: descricao.trim(),
    imagem: '/camisas/' + id.trim() + '.webp',
    estoque,
  })
}

export function editarProduto(banco, id, dados) {
  exigirAdmin(banco)
  const { time, modelo, temporada, liga, preco, descricao, estoque } = dados
  validarProduto({ id, ...dados })
  const produto = banco.produtos.find((p) => p.id === id)
  if (!produto) throw new Error('Produto não encontrado.')
  Object.assign(produto, { time: time.trim(), modelo: modelo.trim(), temporada: temporada.trim(), liga, preco, descricao: descricao.trim(), estoque })
}

export function excluirProduto(banco, id) {
  exigirAdmin(banco)
  banco.produtos = banco.produtos.filter((p) => p.id !== id)
}

export function criarCategoria(banco, { id, nome }) {
  exigirAdmin(banco)
  if (!id.trim() || !nome.trim()) throw new Error('Preencha o identificador e o nome.')
  if (!/^[a-z0-9-]+$/.test(id.trim()))
    throw new Error('Use apenas letras minúsculas, números e hifens no identificador.')
  if (banco.categorias.some((c) => c.id === id.trim()))
    throw new Error('Já existe uma categoria com esse identificador.')
  banco.categorias.push({ id: id.trim(), nome: nome.trim() })
}

export function editarCategoria(banco, id, { nome }) {
  exigirAdmin(banco)
  const cat = banco.categorias.find((c) => c.id === id)
  if (!cat) throw new Error('Categoria não encontrada.')
  if (!nome.trim()) throw new Error('O nome não pode ser vazio.')
  cat.nome = nome.trim()
}

export function excluirCategoria(banco, id) {
  exigirAdmin(banco)
  if (banco.produtos.some((p) => p.liga === id))
    throw new Error('Reclassifique os produtos desta categoria antes de excluí-la.')
  banco.categorias = banco.categorias.filter((c) => c.id !== id)
}

const TRANSICOES = {
  Recebido: ['Enviado', 'Cancelado'],
  Enviado: ['Entregue', 'Cancelado'],
  Entregue: [],
  Cancelado: [],
}

export function statusDisponiveis(statusAtual) {
  return TRANSICOES[statusAtual] || []
}

export function alterarStatusPedido(banco, id, novoStatus) {
  exigirAdmin(banco)
  const pedido = banco.pedidos.find((p) => p.id === id)
  if (!pedido) throw new Error('Pedido não encontrado.')
  if (!TRANSICOES[pedido.status]?.includes(novoStatus))
    throw new Error('Transição de status inválida.')
  if (novoStatus === 'Cancelado') {
    for (const item of pedido.itens) {
      const produto = banco.produtos.find((p) => p.id === item.produtoId)
      if (produto)
        produto.estoque[item.tamanho] = (produto.estoque[item.tamanho] || 0) + item.quantidade
    }
  }
  pedido.status = novoStatus
}
