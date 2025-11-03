const STORAGE_KEY = 'motorStyleCarrinho';

// Função para obter o carrinho do localStorage
function getCarrinho() {
    const carrinhoJson = localStorage.getItem(STORAGE_KEY);
    return carrinhoJson ? JSON.parse(carrinhoJson) : [];
}

// Função para salvar o carrinho no localStorage e atualizar o contador
function saveCarrinho(carrinho) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
    updateContadorCarrinho();
}

// Função para atualizar o contador no navbar (em todas as páginas)
function updateContadorCarrinho() {
    // Usa querySelectorAll para garantir que todos os contadores sejam atualizados
    const contadores = document.querySelectorAll('#contador-carrinho');
    const carrinho = getCarrinho();
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    contadores.forEach(contador => {
        contador.textContent = totalItens;
    });
}

// --- Lógica Central de Adicionar/Remover/Atualizar ---

// Função chamada pelo botão 'Adicionar ao Carrinho'
function addItemToCarrinho(item) {
    const carrinho = getCarrinho();
    // Verifica se o item já existe pelo ID
    const itemExistente = carrinho.find(i => i.id === item.id); 

    if (itemExistente) {
        itemExistente.quantidade += item.quantidade;
    } else {
        carrinho.push(item);
    }

    saveCarrinho(carrinho);
    alert(`${item.nome} adicionado ao carrinho!`);
}

function removeItemFromCarrinho(itemId) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(item => item.id !== itemId);
    saveCarrinho(carrinho);
    renderCarrinho(); // Renderiza novamente a lista
}

function updateItemQuantity(itemId, action) {
    let carrinho = getCarrinho();
    const itemExistente = carrinho.find(item => item.id === itemId);

    if (itemExistente) {
        if (action === 'increase') {
            itemExistente.quantidade++;
        } else if (action === 'decrease' && itemExistente.quantidade > 1) {
            itemExistente.quantidade--;
        }
    }
    saveCarrinho(carrinho);
    renderCarrinho(); // Renderiza novamente a lista
}

// --- Funções Específicas da página carrinho.html ---

function handleCarrinhoActions(event) {
    const target = event.target;
    const itemCard = target.closest('.item-card');
    if (!itemCard) return;

    const itemId = itemCard.dataset.id;
    
    if (target.classList.contains('btn-remover')) {
        removeItemFromCarrinho(itemId);
    }
    if (target.classList.contains('btn-qty')) {
        const action = target.dataset.action;
        updateItemQuantity(itemId, action);
    }
}

function renderCarrinho() {
    const itensCarrinhoContainer = document.querySelector('.itens-carrinho');
    const resumoCompraContainer = document.querySelector('.resumo-compra');
    if (!itensCarrinhoContainer || !resumoCompraContainer) return;

    const carrinho = getCarrinho();
    itensCarrinhoContainer.innerHTML = ''; 

    let subtotal = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        itensCarrinhoContainer.innerHTML = `
            <p style="text-align: center; padding: 50px; font-size: 1.2rem; color: #555;">
                Seu carrinho está vazio. 
                <a href="Catalogo.html" style="color: #007aff; text-decoration: none; font-weight: bold;">Confira nosso catálogo!</a>
            </p>
        `;
        resumoCompraContainer.style.display = 'none';
        return;
    }
    
    resumoCompraContainer.style.display = 'block';

    carrinho.forEach(item => {
        const itemTotal = item.preco * item.quantidade;
        subtotal += itemTotal;
        totalItens += item.quantidade;

        const itemHtml = `
            <article class="item-card" data-id="${item.id}">
                <img src="${item.imagem}" alt="${item.nome}" class="item-thumb" style="max-width: 100px; height: auto;">
                <div class="item-details">
                    <h4 class="item-title">${item.nome}</h4>
                    <p class="item-price">Preço Unitário: R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <div class="quantidade-controls">
                        <button class="btn-qty" data-action="decrease">-</button>
                        <input type="number" value="${item.quantidade}" min="1" class="item-quantidade" readonly>
                        <button class="btn-qty" data-action="increase">+</button>
                    </div>
                    <p class="item-total">Total Item: R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
                    <button class="btn-remover">Remover</button>
                </div>
            </article>
            <hr class="divisor">
        `;
        itensCarrinhoContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
    
    // Insere o botão de continuar comprando após os itens
    itensCarrinhoContainer.insertAdjacentHTML('beforeend', `<a href="Catalogo.html" class="btn btn-secondary continue-comprando">← Continuar Comprando</a>`);


    // Atualiza o Resumo de Compra
    const resumoSubtotalSpan = document.querySelector('.resumo-linha span:first-child');
    if(resumoSubtotalSpan) {
        resumoSubtotalSpan.textContent = `Subtotal (${totalItens} itens)`;
    }
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    let frete = 0.00; // Frete Grátis por padrão
    document.getElementById('frete').textContent = frete > 0 ? `R$ ${frete.toFixed(2).replace('.', ',')}` : 'Grátis';

    const totalFinal = subtotal + frete;
    document.getElementById('total-final').textContent = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
}

// Início: Chama a atualização do contador em todas as páginas
document.addEventListener('DOMContentLoaded', updateContadorCarrinho);

// Início: Se for a página do carrinho, renderiza os itens e configura os listeners
if (document.querySelector('.carrinho-main')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderCarrinho();
        const itensCarrinhoContainer = document.querySelector('.itens-carrinho');
        if(itensCarrinhoContainer) {
             // Adiciona listener para todos os botões de ação do carrinho
             itensCarrinhoContainer.addEventListener('click', handleCarrinhoActions);
        }
    });
}