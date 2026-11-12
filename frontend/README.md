O projeto consiste apenas no frontend. O catálogo, contas, carrinho, pedidos e avaliações estão armazenados no `localStorage` do navegador. As atividades de compra, pagamentos e monitoramento de entrega são simuladas.

 Bibliotecas e ferramentas

Biblioteca ou ferramenta                   Uso no projeto                                                                        

React                                     Componentes, formulários e gerenciamento do estado das telas utilizando `useState`, `useEffect` e Context API. 
React DOM                                 Responsável pela renderização da aplicação na página HTML.                                              
React Router DOM                          Gerencia a navegação, parâmetros nas URLs e rotas protegidas com restrições de perfil.                          
bcryptjs                                   Criação e comparação do hash das senhas utilizadas na demonstração.                        
Vite e plugin React                        Proporciona o ambiente de desenvolvimento e cria a versão para produção.                           
ESLint e plugins React Hooks/React Refresh Realiza a verificação do código JavaScript e das regras dos hooks.                               

O design utilizado foi o CSS próprio, aplicando Flexbox, Grid e media queries. Os ícones são SVGs armazenados localmente. As fontes Manrope e Barlow, assim como as imagens, estão localizadas na pasta `public`. Não são empregados Bootstrap, Tailwind ou bibliotecas de componentes.

As versões das dependências encontram-se no package.json, enquanto as versões resolvidas estão no package-lock.json. A sintaxe utilizada para componentes é JSX. O localStorage é um recurso disponível no navegador, não sendo necessária a instalação de biblioteca.

## Acesso e contas de teste

 Perfil         E-mail                  Senha      Página de acesso 
 
/ Administrador / `admin@camisa10.test`   /`admin123` ;  `/admin`         
/ Cliente       / `cliente@camisa10.test` / `camisa10` | `/login`         

O link dministração, que se localiza no rodapé da loja, leva ao login administrativo. As credenciais acima devem ser informadas, ou pode-se utilizar a opção **Preencher com o administrador de teste** e clicar em **Entrar**. Após a autenticação, a conta administrativa disponibiliza o painel em `/admin`.

Para a conta de cliente, também há um botão de preenchimento na tela de login. O visitante pode selecionar as camisas, escolher os tamanhos e adicionar itens ao carrinho sem realizar login. É solicitada autenticação ao concluir a compra, e o cliente retorna ao checkout com seus produtos.

O registro público cria apenas contas de cliente. O perfil de cliente não tem acesso à administração; o administrador utiliza uma conta de cliente distinta para realizar testes de compra. **Sair** encerra a sessão, que também expira após um período de oito horas.

## Funcionalidades

| Área          | Recursos                                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pública       | Vitrine, catálogo, detalhes dos produtos, pesquisa, filtros por liga, modelo e preço, paginação e carrinho conforme o tamanho.                                         |
| Cliente       | Registro, login, modificação de perfil e endereço, finalização de compra, histórico de pedidos, cancelamento antes do envio e avaliações de produtos entregues.                |
| Administração | Painel, pesquisa e paginação de produtos e pedidos, criação/modificação/remover camisas e categorias, estoque por tamanho e atualização do status dos pedidos. |

Os produtos estão relacionados às categorias através do campo `liga`. Uma categoria que possui camisas associadas só pode ser eliminada após transferir ou excluir essas camisas. Uma camisa em um pedido que foi recebido ou enviado não poderá ser excluída até que o pedido seja finalizado. 
O ciclo dos pedidos é **Recebido → Enviado → Entregue**. Um pedido que está **Recebido** pode ser modificado para **Cancelado**, retornando suas unidades ao estoque apenas uma vez. Os pedidos que foram entregues ou cancelados não têm seu status alterado novamente. Os pedidos mantêm as informações sobre os nomes, tamanhos, quantidades e preços no momento da compra.

## Instruções

É preciso ter o Node.js e npm instalados. Execute os comandos na pasta onde está localizado o `package.json`.

Comando no PowerShell | Objetivo                                        

npm.cmd install`    Realizar a instalação das dependências.         
npm.cmd run dev`     Começar o site no endereço especificado pelo Vite. 
npm.cmd run build`   Criar os arquivos necessários para produção na pasta `dist`.
npm.cmd run preview` Conferir a versão que foi gerada pelo build.  
npm.cmd run lint`    Analisar o código utilizando o ESLint.         

 Notas da demonstração

As informações são autônomas em cada navegador e URL do site. As modificações feitas na administração refletem na loja do mesmo navegador; não há sincronização com um servidor. A conta administrativa é adicionada aos dados da versão anterior sem excluir os pedidos já feitos.

A autenticação e as permissões são simuladas para fins de demonstração. Mesmo com a utilização de hash para senhas, um frontend com `localStorage` não garante autenticação real em produção. Utilize dados fictícios. Os créditos das imagens e marcas podem ser encontrados em `public/creditos.txt`.