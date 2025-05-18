export default defineEventHandler(async () => {
  const printfulApiKey = process.env.PRINTFUL_API_KEY;

  const response = await $fetch('https://api.printful.com/store/products', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${printfulApiKey}`,
    },
  });

  console.log('Printful API Response:', JSON.stringify(response, null, 2));

  if (!response.result) {
    throw new Error('No products found in Printful response');
  }

  const productsWithVariants = await Promise.all(
    response.result.map(async (product: any) => {
      try {
        const productDetails = await $fetch(`https://api.printful.com/store/products/${product.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${printfulApiKey}`,
          },
        });

        console.log(`Product ${product.id} Details:`, JSON.stringify(productDetails, null, 2));

        const syncVariants = productDetails.result?.sync_variants || [];

        if (!syncVariants || syncVariants.length === 0) {
          console.warn(`Product ${product.id} has no sync_variants:`, productDetails);
          return {
            id: String(product.id),
            name: product.name,
            price: 0,
            currency: 'SEK',
            imageUrl: product.thumbnail_url || '',
            type: product.main_category_id || '',
            variantId: '',
            variants: [],
          };
        }

        const variant = syncVariants[0];
        return {
          id: String(product.id),
          name: product.name,
          price: variant.retail_price || 0,
          currency: variant.currency || 'SEK',
          imageUrl: product.thumbnail_url || '',
          type: product.main_category_id || '',
          variantId: String(variant.id),
          variants: syncVariants.map((variant: any) => ({
            id: String(variant.id),
            name: variant.name,
          })),
        };
      } catch (error) {
        console.error(`Error fetching details for product ${product.id}:`, error);
        return {
          id: String(product.id),
          name: product.name,
          price: 0,
          currency: 'USD',
          imageUrl: product.thumbnail_url || '',
          type: product.main_category_id || '',
          variantId: '',
          variants: [],
        };
      }
    })
  );

  return productsWithVariants;
});