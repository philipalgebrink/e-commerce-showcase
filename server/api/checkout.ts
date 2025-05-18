import { Stripe } from 'stripe';
import { useCartStore } from '~/stores/cart';
import Cookies from 'js-cookie';

interface CheckoutRequest {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    name: string;
    price: number;
    currency: string;
    imageUrl: string;
  }>;
  shipping: {
    name: string;
    address1: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutRequest>(event);
  const { items, shipping } = body;

  if (!items || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart is empty',
    });
  }

  const stripeSecretKey = useRuntimeConfig().stripeSecretKey;
  const printfulApiKey = useRuntimeConfig().printfulApiKey;

  if (!stripeSecretKey || !printfulApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error',
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });

  try {
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity * 100,
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: items[0].currency.toLowerCase(), // e.g., 'sek'
      payment_method_types: ['card'],
      metadata: {
        order_type: 'printful_order',
      },
    });

    const printfulOrder = await $fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        recipient: shipping,
        items: items.map((item) => ({
          variant_id: parseInt(item.variantId),
          quantity: item.quantity,
          name: item.name,
        })),
      },
    });

    console.log('Printful Order Response:', JSON.stringify(printfulOrder, null, 2));

    if (!printfulOrder.result) {
      throw new Error('Failed to create Printful order');
    }

    const cartStore = useCartStore();
    cartStore.clearCart();
    Cookies.remove('cart');

    return {
      success: true,
      orderId: printfulOrder.result.id,
      paymentIntentClientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Checkout error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Checkout failed',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
});