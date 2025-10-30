// Busca simples e filtro por categoria
    const input = document.getElementById('q');
    const select = document.getElementById('category');
    const grid = document.getElementById('grid');
    const cards = Array.from(grid.querySelectorAll('.card'));

    function applyFilters(){
      const q = input.value.trim().toLowerCase();
      const cat = select.value;
      cards.forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const category = card.dataset.category;
        const matchQ = q === '' || title.includes(q);
        const matchCat = cat === 'todos' || cat === category;
        card.style.display = (matchQ && matchCat) ? '' : 'none';
      });
    }

    input.addEventListener('input', applyFilters);
    select.addEventListener('change', applyFilters);
