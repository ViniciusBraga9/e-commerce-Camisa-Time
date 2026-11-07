import { exigirCliente, novoId } from './banco'

export function adicionarItem(banco, produtoId, tamanho, quantidade) {
  const produto = banco.produtos.find((registro) => registro.id === produtoId)
  const existente = banco.carrinho.find(
    (linha) => linha.produtoId === produtoId && linha.tamanho === tamanho,
  )
  const total = (existente?.quantidade || 0) + quantidade
  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    !produto?.estoque[tamanho] ||
    total > produto.estoque[tamanho]
  ) {
    throw new Error('A quantidade supera o estoque desse tamanho. Confira seu carrinho.')
  }
  if (existente) existente.quantidade = total
  else banco.carrinho.push({ produtoId, tamanho, quantidade })
}

export function mudarQuantidade(banco, produtoId, tamanho, quantidade) {
  const item = banco.carrinho.find(
    (linha) => linha.produtoId === produtoId && linha.tamanho === tamanho,
  )
  if (!item) throw new Error('Este item já foi removido do carrinho.')
  if (quantidade === 0) {
    banco.carrinho = banco.carrinho.filter((linha) => linha !== item)
    return
  }
  const produto = banco.produtos.find((registro) => registro.id === produtoId)
  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    quantidade > (produto?.estoque[tamanho] || 0)
  ) {
    throw new Error('Quantidade indisponível para esse tamanho.')
  }
  item.quantidade = quantidade
}

export function itensDoCarrinho(banco) {
  return banco.carrinho.map((item) => {
    const produto = banco.produtos.find((registro) => registro.id === item.produtoId)
    return {
      ...item,
      nome: produto?.time || 'Camisa indisponível',
      modelo: produto ? produto.modelo + ' · ' + produto.temporada : '',
      imagem: produto?.imagem,
      preco: produto?.preco || 0,
      estoque: produto?.estoque[item.tamanho] || 0,
    }
  })
}

export const totalItens = (itens) =>
  itens.reduce((soma, linha) => soma + linha.preco * linha.quantidade, 0)

export function criarPedido(banco, endereco, pagamento) {
  const cliente = exigirCliente(banco)
  const itens = itensDoCarrinho(banco)
  if (!itens.length) throw new Error('Seu carrinho está vazio.')
  if (!['Pix', 'Cartão'].includes(pagamento)) throw new Error('Escolha uma forma de pagamento.')
  if (itens.some((linha) => linha.quantidade < 1 || linha.quantidade > linha.estoque)) {
    throw new Error('O estoque mudou. Ajuste as quantidades no carrinho.')
  }
  // O pedido guarda os preços da compra, mesmo que o catálogo mude depois.
  const id = 'C10-' + banco.proximoPedido
  banco.proximoPedido += 1
  banco.pedidos.unshift({
    id,
    clienteId: cliente.id,
    destinatario: cliente.nome,
    data: new Date().toISOString(),
    status: 'Recebido',
    itens,
    endereco,
    pagamento,
    total: totalItens(itens),
  })
  for (const item of itens) {
    const produto = banco.produtos.find((registro) => registro.id === item.produtoId)
    produto.estoque[item.tamanho] -= item.quantidade
  }
  banco.carrinho = []
  return id
}

export function cancelarPedido(banco, id) {
  const cliente = exigirCliente(banco)
  const pedido = banco.pedidos.find(
    (registro) => registro.id === id && registro.clienteId === cliente.id,
  )
  if (pedido?.status !== 'Recebido') throw new Error('Esse pedido já não pode ser cancelado.')
  pedido.status = 'Cancelado'
  for (const item of pedido.itens) {
    const produto = banco.produtos.find((registro) => registro.id === item.produtoId)
    if (produto)
      produto.estoque[item.tamanho] = (produto.estoque[item.tamanho] || 0) + item.quantidade
  }
}

export function podeAvaliar(banco, clienteId, produtoId) {
  return banco.pedidos.some(
    (pedido) =>
      pedido.clienteId === clienteId &&
      pedido.status === 'Entregue' &&
      pedido.itens.some((linha) => linha.produtoId === produtoId),
  )
}

export function salvarAvaliacao(banco, produtoId, nota, mensagem) {
  const cliente = exigirCliente(banco)
  if (!podeAvaliar(banco, cliente.id, produtoId))
    throw new Error('A avaliação é liberada após a entrega.')
  if (!Number.isInteger(nota) || nota < 1 || nota > 5 || !mensagem.trim()) {
    throw new Error('Escolha uma nota e escreva seu comentário.')
  }
  const anterior = banco.avaliacoes.find(
    (avaliacao) => avaliacao.clienteId === cliente.id && avaliacao.produtoId === produtoId,
  )
  const dados = { nota, mensagem: mensagem.trim(), data: new Date().toISOString() }
  if (anterior) Object.assign(anterior, dados)
  else banco.avaliacoes.push({ id: novoId(), clienteId: cliente.id, produtoId, ...dados })
}

export function excluirAvaliacao(banco, id) {
  const cliente = exigirCliente(banco)
  banco.avaliacoes = banco.avaliacoes.filter(
    (avaliacao) => !(avaliacao.id === id && avaliacao.clienteId === cliente.id),
  )
}
