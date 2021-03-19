import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
// import { textSpanEnd } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    } 
    
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartItems: Product[] = [...cart];
  
      const productInCart = cartItems.find(item => item.id === productId);

      if (productInCart !== undefined) {
        const stockItems: UpdateProductAmount = await api.get(`/stock/${productId}`)
          .then((response) => {
            return response.data;
          });

        if (productInCart.amount < stockItems.amount) {
          productInCart.amount++;
          
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartItems))
          
          setCart(cartItems);

        } else {
          toast.error('Quantidade solicitada fora de estoque');

        }
      } else {
        const currentProduct = await api.get(`/products/${productId}`)
          .then((response) => {
            return response.data;
          });

        if (currentProduct.amount < 1) {
          toast.error('Quantidade solicitada fora de estoque');

        } else {
          currentProduct.amount = 1;

          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, currentProduct]))
            
          setCart([...cart, currentProduct])
        }
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartProducts = [...cart];
      const newProducts = cartProducts.filter(product => product.id !== productId);

      if (newProducts.length !== cartProducts.length) {
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProducts));
        
        setCart(newProducts);
        
      } else {
        toast.error('Erro na remoção do produto');
      }
    } catch {
      toast.error('Erro na remoção do produto');

    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
   
    try {
      if (amount <= 0) {
        return;
      }

      const cartProducts = [...cart];
      const newCart = cartProducts.filter(product => product.id !== productId);

      const productToBeUpdated = cartProducts.filter(product => product.id === productId);

      if (productToBeUpdated) {
        const productStock = await api.get<Stock>(`/stock/${productId}`)
          .then(response => response.data);
        
        if (amount <= productStock.amount) {
          productStock.amount = amount;
          productToBeUpdated[0].amount = amount;

          setCart([
            ...newCart,
            productToBeUpdated[0]
          ]);

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));

        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        toast.error('Erro na alteração de quantidade do produto');
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
