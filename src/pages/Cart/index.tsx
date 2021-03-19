import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}


const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    priceFormatted: formatPrice(product.price),
    subtotal: (product.amount * product.price).toFixed(2)
  }));


  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal += (product.price * product.amount);

        return sumTotal;
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    const productToIncrement = {
      productId: product.id,
      amount: product.amount + 1
    };

    updateProductAmount(productToIncrement);
  }

  function handleProductDecrement(product: Product) {
    if (product.amount === 1) {
      return;
    }

    const productToDecrement = {
      productId: product.id,
      amount: product.amount - 1
    };

    updateProductAmount(productToDecrement);
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>


        <tbody>
          {cart.map((cartItem, index) => (
            <tr data-testid="product" key={cartItem.id}>
              <td>
                <img src={cartItem.image} alt={cartItem.title} />
              </td>
              <td>
                <strong>{cartItem.title}</strong>
                <span>{cartFormatted[index].priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={cartItem.amount <= 1}
                    onClick={() => handleProductDecrement(cartItem)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={cartItem.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(cartItem)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{cartFormatted[index].subtotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(cartItem.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
