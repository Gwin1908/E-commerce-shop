import cardsJSON from './cards.json' assert {type: 'json'};
console.log(cardsJSON);

const cardList = document.querySelector('.cards');
const featuredList = document.querySelector('.featured-cards');
const search = document.querySelector('.search-input');
const searchErase = document.querySelector('.fa-x');
const companyFilter = document.querySelectorAll('.company');
const inputPrice = document.querySelector('.price-value');
const outputPrice = document.querySelector('.filter-max-price');
const cartIcon = document.querySelector('.cart-icon');
const cart = document.querySelector('.cart-items');
const closeIcon = document.querySelector('.close');
const cartSection = document.querySelector('.cart-section');
const total = document.querySelector('.total-sum');
const numberItems = document.querySelector('.number-of-items');

let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let cartItem = '';   

if (cardList) {
    window.addEventListener("load", () => {
        renderProducts(cardsJSON);
        loadCart(cartItems);
        renderNumberInCart();
        filterForm();
    });
} else if (featuredList) {
    window.addEventListener("load", () => {
        renderFeatured(cardsJSON);
        loadCart(cartItems);
        renderNumberInCart();
    });
} else {
    window.addEventListener("load", () => {
    loadCart(cartItems);
    renderNumberInCart();
})
}

const renderFeatured = (data) => {
    data.forEach(({productName, photo, price, featured}) => {
        if (featured === 1) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = 
                `<img src="${photo}" alt="${productName}">
                <p class="card-name">${productName}</p>
                <span class="card-price dollar">${price}</span>`
            featuredList.appendChild(card);
        }
    });
}

const renderProducts = (data) => {
    data.forEach(({productName, photo, price, company, id}) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = 
        `<img src="${photo}" alt="${productName}">
        <p class="card-name">${productName}</p>
        <p class="card-company hidden">${company}</p>
        <span class="card-price dollar">${price}</span>
        <button class="add-cart">
        <i class="fa-solid fa-plus fa-lg"></i>
        </button>`
        const buttonAdd = card.querySelector('button')
        buttonAdd.addEventListener('click', () => {
            addToCart(productName, photo, price, company, id);
        })
        cardList.appendChild(card);
    });
}

const addToCart = (productName, photo, price, company, id) => {
    let isChecked = true;
    cartItems.forEach(item => {
        if (item.itemId === id) {
            item.itemAmount+=1;
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            loadCart(cartItems);
            isChecked = false;
        } 
    });
    if (isChecked) {
        addItemToCart({productName, photo, price, company, id});
    }
}

const addItemToCart = ({productName, photo, price, id}) =>{
    const cartItem = {
        itemName: productName,
        itemPrice: price,
        itemPhoto: photo,
        itemId: id,
        itemAmount: 1
    }
    cartItems.push(cartItem)
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    loadCart(cartItems);
    renderNumberInCart();
}

const loadCart = (cartItems) => {
    cart.innerHTML = "";
    cartItems.forEach(({itemName, itemPhoto, itemPrice, itemAmount, itemId}) => {
        constructCartItem(itemName, itemPhoto, itemPrice, itemAmount, itemId);
    });
    renderTotalSum();
}

const constructCartItem = (productName, photo, price, amount, id) => {
    cartItem = document.createElement('div');
    createCartItemTemplate(productName, photo, price, amount);
    createCartItemButtons(productName, id);
    cart.appendChild(cartItem);
}

const createCartItemTemplate = (productName, photo, price, amount) => {
    cartItem.classList.add('item');
    cartItem.innerHTML = 
        `<img src="${photo}" alt="${productName}">
        <div class="info">
            <span class="info-name">${productName}</span>
            <span class="info-price dollar">${price}</span>
            <span class="info-remove">remove</span>
        </div>
        <div class="amount">
            <button class="more">
                <i class="fa-solid fa-angle-up"></i>
            </button>
            <span class="item-amount">${amount}</span>
            <button class="less">
                <i class="fa-solid fa-angle-down"></i>
            </button>
        </div>`;
}

const createCartItemButtons = (productName, id) => {
    const removeBtn = cartItem.querySelector('.info-remove')
    removeBtn.addEventListener("click", () => {
        cartItems = cartItems.filter((item) => productName !== item.itemName)
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        loadCart(cartItems);
        renderTotalSum();
        renderNumberInCart();
    });
    const moreBtn = cartItem.querySelector('.more');
    moreBtn.addEventListener('click', () => {
        cartItems.map((item) => {
            if (item.itemId === id) {
                item.itemAmount+=1;
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
            }
        })
        loadCart(cartItems);
        renderTotalSum();
    })
    const lessBtn = cartItem.querySelector('.less');
    lessBtn.addEventListener('click', () => {
        cartItems.map((item) => {
            if (item.itemId === id) {
                item.itemAmount-=1;
                if (item.itemAmount<=0) {
                    cartItems = cartItems.filter((item) => productName !== item.itemName)
                }
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
            }
        })
        loadCart(cartItems);
        renderTotalSum();
        renderNumberInCart();
    })
}

const renderNumberInCart = () => {
    numberItems.textContent = cartItems.length;
}

const renderTotalSum = () => {
    const totalSum = cartItems.reduce((accumulator, currentValue) => accumulator + currentValue.itemAmount * currentValue.itemPrice, 0);
    total.textContent = totalSum.toFixed(2);
}

const filterForm = () => {
    initializeSearchInput();
    initializeCompanyInput();
    initializePriceInput();
}

const initializeSearchInput = () => {
    search.addEventListener('focus', () => {
        removeHighligth(companyFilter);
        clearCardList();
        renderProducts(cardsJSON);
        setMaxPriceRange();
    })
    search.addEventListener('input', (e) => {
        const inputValue = e.target.value.trim();
        const regInput = new RegExp (`${inputValue}`, 'i');
        const cardsArr = cardList.querySelectorAll('.card');
        if (inputValue) {
            filterProducts(cardsArr, '.card-name', regInput);
        }
    })
    searchErase.addEventListener('click', () => {
        search.value = "";
    })
}

const filterProducts = (arr, selector, input) => {
    arr.forEach(elem => {
        const cardName = elem.querySelector(selector);
        if (cardName.textContent.search(input) === -1) {
            elem.classList.add('hidden');
        } else {
            elem.classList.remove('hidden');
        }
    })
}

const initializeCompanyInput = () => {
    companyFilter.forEach(e => {
        e.addEventListener('click', (e) => {
            const selectedCompany = e.target.textContent;
            const filteredCardsArr = cardsJSON.filter((item)=> selectedCompany === item.company)
            if (selectedCompany==='All') {
                removeHighligth(companyFilter);
                clearCardList();
                renderProducts(cardsJSON);
                setMaxPriceRange();
            } else {
                removeHighligth(companyFilter);
                e.target.classList.add('active');
                clearCardList();
                renderProducts(filteredCardsArr);
                setMaxPriceRange();
                filterByPrice(inputPrice);
            }
        })  
    });
}

const clearCardList = () => {
    cardList.innerHTML = ''
}

const setMaxPriceRange = () => {
    const pricesNodeArr = cardList.querySelectorAll('.card-price');
    let pricesArr = Array.from(pricesNodeArr).map((t) => t.textContent).map(Number);
    const maxPrice = Math.ceil(Math.max(...pricesArr));
    inputPrice.max = maxPrice;
    inputPrice.value = maxPrice;
    filterByPrice(inputPrice);
}

const filterByPrice = (input) => {
    outputPrice.textContent = input.value;
    const cardsArr = cardList.querySelectorAll('.card');
    cardsArr.forEach(elem => {
        let price = elem.querySelector('.card-price');
        price = parseInt(price.textContent);
        if (price > parseInt(input.value)) {
            elem.classList.add('hidden');
        } else {
            elem.classList.remove('hidden');
        }
    });
}

const initializePriceInput = () => {
    inputPrice.addEventListener('input', (input) => {
        filterByPrice(input.target);
    })
}

const removeHighligth = (arr) => {
    arr.forEach(elem => {
        elem.classList.remove('active');
    });
}

cartIcon.addEventListener('click', () => {
    cartSection.classList.toggle('hidden') ;
    document.body.style.overflow = "hidden";
})

closeIcon.addEventListener('click', () => {
    cartSection.classList.add('hidden');
    document.body.style.overflow = "visible";
})







