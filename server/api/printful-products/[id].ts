export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const printfulApiKey = process.env.PRINTFUL_API_KEY;

  const productDescriptions: Record<string, string> = {
    '382590629': 'The Unisex mo$tvalue LOGO Tee gives a rich and structured look to the classic t-shirt and works great for layered streetwear outfits. Thanks to its durable fabric, it maintains sharp lines along the edges and lasts a long time.',
    '382590612': 'With a large front pouch pocket and drawstrings in a matching color, this Unisex mo$tvalue LOGO Hoodie is a sure crowd-favorite. It’s soft, stylish, and perfect for cooler evenings.',
  };

  try {
    const productDetails = await $fetch(`https://api.printful.com/store/products/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${printfulApiKey}`,
      },
    });

    console.log(`Printful /store/products/${id} Response:`, JSON.stringify(productDetails, null, 2));

    if (!productDetails.result) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const product = productDetails.result.sync_product;
    const syncVariants = productDetails.result.sync_variants || [];

    const frontImage = `/images/products/${id}/front.png`;
    const backImage = `/images/products/${id}/back.png`;

    if (!syncVariants || syncVariants.length === 0) {
      console.warn(`Product ${id} has no sync_variants:`, productDetails);
      return {
        id: String(product.id),
        name: product.name,
        price: 0,
        currency: 'SEK',
        imageUrls: [frontImage, backImage],
        type: 'Unknown',
        variantId: '',
        variants: [],
        isAvailable: false,
        brand: '',
        model: '',
        description: productDescriptions[id] || 'No description available.',
      };
    }

    const variant = syncVariants[0];

    return {
      id: String(product.id),
      name: product.name,
      price: variant.retail_price || 0,
      currency: variant.currency || 'SEK',
      imageUrls: [frontImage, backImage],
      type: variant.product?.type || 'Unknown',
      variantId: String(variant.id),
      variants: syncVariants.map((variant: any) => ({
        id: String(variant.id),
        name: variant.name,
        size: variant.size || '',
        color: variant.color || '',
        colorCode: variant.color_code || '',
      })),
      isAvailable: true,
      brand: variant.product?.brand || '',
      model: variant.product?.model || '',
      description: productDescriptions[id] || 'No description available.',
    };
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
});