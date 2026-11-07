import { ligasIniciais, produtosIniciais } from './catalogo'

const endereco = {
  cep: '58400-000',
  rua: 'Rua do Estádio',
  numero: '10',
  bairro: 'Centro',
  cidade: 'Campina Grande',
  uf: 'PB',
  complemento: '',
}

const clienteDemo = {
  id: 'cliente-demo',
  nome: 'Lia Costa',
  email: 'cliente@camisa10.test',
  perfil: 'cliente',
  assinatura: '$2b$10$jirzHWViaw3BPj3pGJyTyehjxdx29tLEbUDda7yXu6bJKP.gNJ2qK',
  endereco,
}

function pedidoExemplo(id, produtoId, status, dias) {
  const produto = produtosIniciais.find((item) => item.id === produtoId)
  return {
    id,
    clienteId: clienteDemo.id,
    status,
    data: new Date(Date.now() - dias * 86400000).toISOString(),
    destinatario: clienteDemo.nome,
    endereco,
    pagamento: 'Pix',
    total: produto.preco,
    itens: [
      {
        produtoId,
        nome: produto.time,
        modelo: produto.modelo + ' · ' + produto.temporada,
        imagem: produto.imagem,
        tamanho: 'M',
        quantidade: 1,
        preco: produto.preco,
      },
    ],
  }
}

export function dadosIniciais() {
  return {
    categorias: ligasIniciais,
    produtos: produtosIniciais,
    usuarios: [clienteDemo],
    sessao: null,
    carrinho: [],
    pedidos: [
      pedidoExemplo('C10-1002', 'city', 'Enviado', 3),
      pedidoExemplo('C10-1001', 'vasco', 'Entregue', 12),
    ],
    proximoPedido: 1003,
    avaliacoes: [],
  }
}
