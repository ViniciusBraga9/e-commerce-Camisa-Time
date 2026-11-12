import { useEffect, useState } from 'react'
import { CHAVE, gravarBanco, lerBanco, usuarioAtual } from '../services/banco'
import { LojaContext } from './LojaContext'

function carregar() {
  try {
    return { banco: lerBanco(), erro: '' }
  } catch {
    return {
      banco: null,
      erro: 'Não foi possível abrir os dados da loja neste navegador.',
    }
  }
}

export default function LojaProvider({ children }) {
  const [estado, setEstado] = useState(carregar)
  const banco = estado.banco
  const expiraEm = banco?.sessao?.expiraEm

  // Outra aba pode alterar o carrinho ou encerrar a sessão.
  useEffect(() => {
    function sincronizar(evento) {
      if (evento.key === CHAVE || evento.key === null) setEstado(carregar())
    }
    window.addEventListener('storage', sincronizar)
    const restante = expiraEm - Date.now()
    let timer
    if (restante > 0) timer = setTimeout(() => setEstado(carregar()), restante + 10)
    return () => {
      window.removeEventListener('storage', sincronizar)
      clearTimeout(timer)
    }
  }, [expiraEm])

  function alterar(acao) {
    // Lê uma cópia antes de modificar e salva toda a operação de uma vez.
    const atual = lerBanco()
    const resultado = acao(atual)
    gravarBanco(atual)
    setEstado({ banco: atual, erro: '' })
    return resultado
  }

  if (estado.erro)
    return (
      <main className="container pagina">
        <h1>Dados da loja indisponíveis</h1>
        <p role="alert">{estado.erro}</p>
        <button className="botao" onClick={() => setEstado(carregar())}>
          Tentar novamente
        </button>
      </main>
    )
  return (
    <LojaContext.Provider value={{ banco, alterar, usuario: usuarioAtual(banco) }}>
      {children}
    </LojaContext.Provider>
  )
}
