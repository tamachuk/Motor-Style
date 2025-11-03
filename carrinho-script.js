const CART_STORAGE_KEY = 'motorstyle_carrinho';
const FRETE_GRATIS_MIN_VALUE = 3000; // Frete grátis acima de R$ 3000,00

// ==========================================================
// 1. Funções de Utilitário e Storage
// ==========================================================

function getCart() {
    // Carrega o carrinho do LocalStorage ou retorna um array vazio
    const cartJSON = localStorage.getItem(CART_STORAGE_KEY);
    return cartJSON ? JSON.parse(cartJSON) : [];
}

function saveCart(cart) {
    // Salva o carrinho no LocalStorage e atualiza o contador
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter(); 
}

function formatPrice(value) {
    // Formata o número para o padrão monetário brasileiro (R$ X.XXX,XX)
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ==========================================================
// 2. Funções Compartilhadas (Usadas em todas as Páginas)
// ==========================================================

// Função que atualiza o número exibido no ícone do carrinho
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantidade, 0);
    const counterElement = document.getElementById('contador-carrinho');
    
    if (counterElement) {
        counterElement.textContent = totalItems;
    }
}

// Função chamada pelas páginas de produto para adicionar um item
function addItemToCarrinho(item) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
        // Se o item já existe, aumenta a quantidade
        cart[existingItemIndex].quantidade += item.quantidade;
    } else {
        // Se é um novo item, adiciona ao carrinho
        cart.push(item);
    }

    saveCart(cart);
    alert(`"${item.nome}" foi adicionado ao seu carrinho!`);
}

// ==========================================================
// 3. Funções Específicas do Carrinho.html
// ==========================================================

function calculateTotals(cart) {
    // Calcula o subtotal dos produtos
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    // Define a regra do frete
    const freteValor = subtotal >= FRETE_GRATIS_MIN_VALUE ? 0 : 50.00;
    
    const total = subtotal + freteValor;

    return { subtotal, freteValor, total };
}

function updateSummary(totals, itemCount) {
    // Atualiza o resumo do pedido na lateral
    document.getElementById('subtotal-label').textContent = `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'itens'})`;
    document.getElementById('subtotal-valor').textContent = formatPrice(totals.subtotal);
    document.getElementById('total-final').textContent = formatPrice(totals.total);

    // Atualiza o frete com cor verde se for grátis
    const freteElement = document.getElementById('frete');
    if (totals.freteValor === 0) {
        freteElement.textContent = 'Grátis';
        freteElement.style.color = 'green';
    } else {
        freteElement.textContent = formatPrice(totals.freteValor);
        freteElement.style.color = 'inherit';
    }
    
    // Habilita/Desabilita o botão de finalizar compra
    const checkoutButton = document.getElementById('btn-finalizar-compra');
    if (itemCount > 0) {
        checkoutButton.style.pointerEvents = 'auto';
        checkoutButton.style.opacity = '1';
        checkoutButton.title = '';
    } else {
        checkoutButton.style.pointerEvents = 'none';
        checkoutButton.style.opacity = '0.5';
        checkoutButton.title = 'Adicione itens ao carrinho para finalizar a compra.';
    }
}

function renderCart() {
    const cart = getCart();
    const listContainer = document.getElementById('lista-de-itens');
    const emptyMessage = document.getElementById('carrinho-vazio-mensagem');
    
    // Limpa o container
    listContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        updateSummary(calculateTotals([]), 0);
        return;
    }

    emptyMessage.style.display = 'none';
    
    // Renderiza cada item na tela
    cart.forEach(item => {
        const itemCard = document.createElement('article');
        itemCard.className = 'item-card';
        itemCard.setAttribute('data-id', item.id);

        const precoTotalItem = item.preco * item.quantidade;

        // Estrutura do cartão do item
        itemCard.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" class="item-thumb">
            <div class="item-info">
                <h4 class="item-title">${item.nome}</h4>
                <p class="item-price-unit">${formatPrice(item.preco)} / un.</p>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button class="btn-qty-minus" data-id="${item.id}" ${item.quantidade <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" class="item-quantity" value="${item.quantidade}" min="1" data-id="${item.id}" readonly>
                        <button class="btn-qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn-remover" data-id="${item.id}">Remover</button>
                </div>
            </div>
            <div class="item-total-price">
                ${formatPrice(precoTotalItem)}
            </div>
        `;
        listContainer.appendChild(itemCard);
    });

    // Calcula e atualiza o resumo
    const totals = calculateTotals(cart);
    const totalItemsCount = cart.reduce((total, item) => total + item.quantidade, 0);
    updateSummary(totals, totalItemsCount);

    // Anexa os listeners de evento
    attachCartEventListeners();
}

function updateQuantity(itemId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        const newQuantity = cart[itemIndex].quantidade + change;
        
        if (newQuantity >= 1) {
            cart[itemIndex].quantidade = newQuantity;
            saveCart(cart);
            renderCart(); // Re-renderiza para atualizar os totais e o HTML
        }
    }
}

function removeItem(itemId) {
    let cart = getCart();
    
    // Cria um novo carrinho sem o item removido
    cart = cart.filter(item => item.id !== itemId);
    
    saveCart(cart);
    renderCart(); // Re-renderiza para atualizar a lista e os totais
}

function attachCartEventListeners() {
    // Adiciona listener para botões de quantidade e remover APÓS a renderização
    document.querySelectorAll('.btn-qty-plus').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.target.getAttribute('data-id');
            updateQuantity(itemId, 1);
        };
    });

    document.querySelectorAll('.btn-qty-minus').forEach(button => {
        button.onclick = (e) => {
            const itemId = e.target.getAttribute('data-id');
            updateQuantity(itemId, -1);
        };
    });

    document.querySelectorAll('.btn-remover').forEach(button => {
        button.onclick = (e) => {
            if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
                const itemId = e.target.getAttribute('data-id');
                removeItem(itemId);
            }
        };
    });
}

// ==========================================================
// Inicialização
// ==========================================================

// Executa quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    // Se for a página do carrinho, renderiza a lista
    if (document.getElementById('lista-de-itens')) {
        renderCart();
    }
    
    // Sempre atualiza o contador (em qualquer página)
    updateCartCounter(); 
});

// Tornando as funções globais para que as páginas de produto possam usá-las
window.addItemToCarrinho = addItemToCarrinho; 
window.updateCartCounter = updateCartCounter;