import { normalizar, novoId, usuarioAtual } from './banco'

export const TAMANHOS = ['P', 'M', 'G', 'GG']
export const STATUS_PEDIDOS = ['Recebido', 'Enviado', 'Entregue', 'Cancelado']

export function exigirAdmin(banco) {
  const usuario = usuarioAtual(banco)
  if (!usuario || usuario.perfil !== 'admin') {
    throw new Error('Entre com uma conta de administrador para continuar.')
  }
}

export function validarProduto(form, categorias) {
  const erros = {}
  if (form.time.trim().length < 2) erros.time = 'Informe o time ou a seleção.'
  if (!form.modelo.trim()) erros.modelo = 'Informe o modelo da camisa.'
  if (!form.temporada.trim()) erros.temporada = 'Informe a temporada ou edição.'
  if (!categorias.some((categoria) => categoria.id === form.liga)) {
    erros.liga = 'Selecione uma categoria cadastrada.'
  }
  const preco = Number(form.preco)
  if (!Number.isFinite(preco) || preco <= 0 || preco > 99999.99) {
    erros.preco = 'Informe um preço entre R$ 0,01 e R$ 99.999,99.'
  } else if (Math.abs(preco * 100 - Math.round(preco * 100)) > 0.00001) {
    erros.preco = 'Use no máximo duas casas decimais.'
  }
  if (form.descricao.trim().length < 10) {
    erros.descricao = 'Descreva a camisa com pelo menos 10 caracteres.'
  }
  // As fotos podem estar na pasta public ou em um endereço de imagem.
  if (!/^(\/(?!\/)[^\s]+|https?:\/\/[^\s]+)$/i.test(form.imagem.trim())) {
    erros.imagem = 'Informe um caminho como /camisas/vasco.webp ou uma URL https://.'
  }
  for (const tamanho of TAMANHOS) {
    const valor = form.estoque[tamanho]
    const quantidade = Number(valor)
    if (
      String(valor).trim() === '' ||
      !Number.isInteger(quantidade) ||
      quantidade < 0 ||
      quantidade > 9999
    ) {
      erros['estoque-' + tamanho] = 'Use um número inteiro de 0 a 9999.'
    }
  }
  return erros
}

export function salvarProduto(banco, form, id) {
  exigirAdmin(banco)
  const erros = validarProduto(form, banco.categorias)
  if (Object.keys(erros).length) throw new Error(Object.values(erros)[0])
  const produto = id ? banco.produtos.find((item) => item.id === id) : null
  if (id && !produto) throw new Error('A camisa não existe mais. Volte à lista.')
  const dados = {
    time: form.time.trim(),
    modelo: form.modelo.trim(),
    temporada: form.temporada.trim(),
    liga: form.liga,
    preco: Math.round(Number(form.preco) * 100),
    descricao: form.descricao.trim(),
    imagem: form.imagem.trim(),
    estoque: {},
  }
  for (const tamanho of TAMANHOS) dados.estoque[tamanho] = Number(form.estoque[tamanho])
  if (produto) Object.assign(produto, dados)
  else banco.produtos.push({ id: novoId(), ...dados })
}

export function excluirProduto(banco, id) {
  exigirAdmin(banco)
  if (!banco.produtos.some((produto) => produto.id === id)) {
    throw new Error('A camisa já foi excluída.')
  }
  const pendente = banco.pedidos.some(
    (pedido) =>
      ['Recebido', 'Enviado'].includes(pedido.status) &&
      pedido.itens.some((item) => item.produtoId === id),
  )
  if (pendente)
    throw new Error(
      'Esta camisa está em um pedido em andamento. Conclua o pedido antes de excluí-la.',
    )
  banco.produtos = banco.produtos.filter((produto) => produto.id !== id)
  banco.carrinho = banco.carrinho.filter((item) => item.produtoId !== id)
  banco.avaliacoes = banco.avaliacoes.filter((avaliacao) => avaliacao.produtoId !== id)
  // Os pedidos mantêm a cópia dos itens e dos preços da compra.
}

export function validarCategoria(form, categorias, id) {
  const erros = {}
  if (form.nome.trim().length < 2) erros.nome = 'Informe um nome com pelo menos 2 letras.'
  if (
    categorias.some(
      (categoria) =>
        categoria.id !== id && normalizar(categoria.nome) === normalizar(form.nome),
    )
  ) {
    erros.nome = 'Já existe uma categoria com esse nome.'
  }
  if (form.descricao.trim().length < 5)
    erros.descricao = 'Escreva uma descrição com pelo menos 5 caracteres.'
  return erros
}

export function salvarCategoria(banco, form, id) {
  exigirAdmin(banco)
  const erros = validarCategoria(form, banco.categorias, id)
  if (Object.keys(erros).length) throw new Error(Object.values(erros)[0])
  const dados = { nome: form.nome.trim(), descricao: form.descricao.trim() }
  if (id) {
    const categoria = banco.categorias.find((item) => item.id === id)
    if (!categoria) throw new Error('A categoria não existe mais. Volte à lista.')
    Object.assign(categoria, dados)
  } else {
    banco.categorias.push({ id: novoId(), ...dados })
  }
}

export function excluirCategoria(banco, id) {
  exigirAdmin(banco)
  if (banco.produtos.some((produto) => produto.liga === id)) {
    throw new Error(
      'Esta categoria tem camisas vinculadas. Altere a categoria dessas camisas antes de excluí-la.',
    )
  }
  banco.categorias = banco.categorias.filter((categoria) => categoria.id !== id)
}

export function proximosStatus(status) {
  if (status === 'Recebido') return ['Enviado', 'Cancelado']
  if (status === 'Enviado') return ['Entregue']
  return []
}

export function alterarStatusPedido(banco, id, status) {
  exigirAdmin(banco)
  const pedido = banco.pedidos.find((item) => item.id === id)
  if (!pedido) throw new Error('Pedido não encontrado.')
  if (!proximosStatus(pedido.status).includes(status)) {
    throw new Error(
      'Essa mudança de status não está disponível. Confira a situação atual do pedido.',
    )
  }
  // O estoque já foi descontado no checkout. Só o cancelamento devolve unidades.
  if (status === 'Cancelado') {
    for (const item of pedido.itens) {
      const produto = banco.produtos.find((registro) => registro.id === item.produtoId)
      if (produto) produto.estoque[item.tamanho] += item.quantidade
    }
  }
  pedido.status = status
}
