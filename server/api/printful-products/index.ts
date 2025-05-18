// server/api/printful-products/index.ts
export default defineEventHandler(async () => {
  const printfulApiKey = process.env.PRINTFUL_API_KEY;

  const productDescriptions: Record<string, string> = {
    '382588001': 'The Unisex mo$tvalue LOGO Tee gives a rich and structured look to the classic t-shirt and works great for layered streetwear outfits. Thanks to its durable fabric, it maintains sharp lines along the edges and lasts a long time. Add your design, and surprise your customers with a trendy tee option.',
    '382588002': 'With a large front pouch pocket and drawstrings in a matching color, this Unisex mo$tvalue LOGO Hoodie is a sure crowd-favorite. It’s soft, stylish, and perfect for cooler evenings.',
  };

  const response = await $fetch('https://api.printful.com/store/products', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${printfulApiKey}`,
    },
  });

  console.log('Printful /store/products Response:', JSON.stringify(response, null, 2));

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

        console.log(`Printful /store/products/${product.id} Response:`, JSON.stringify(productDetails, null, 2));

        const syncVariants = productDetails.result?.sync_variants || [];

        const frontImage = `/images/products/${product.id}/front.png`;
        const backImage = `/images/products/${product.id}/back.png`;

        if (!syncVariants || syncVariants.length === 0) {
          console.warn(`Product ${product.id} has no sync_variants:`, productDetails);
          return {
            id: String(product.id),
            name: product.name,
            price: 0,
            currency: 'SEK',
            imageUrls: [frontImage, backImage],
            type: product.main_category_id || 'Unknown',
            variantId: '',
            variants: [],
            isAvailable: false,
            description: productDescriptions[product.id] || 'No description available.',
          };
        }

        syncVariants.forEach((variant: any) => {
          console.log(`Variant ${variant.id} (${variant.name}) Details:`, {
            availability_status: variant.availability_status || 'N/A',
          });
        });

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
          description: productDescriptions[product.id] || 'No description available.',
        };
      } catch (error) {
        console.error(`Error fetching details for product ${product.id}:`, error);
        return {
          id: String(product.id),
          name: product.name,
          price: 0,
          currency: 'SEK',
          imageUrls: [`/images/products/${product.id}/front.png`, `/images/products/${product.id}/back.png`],
          type: product.main_category_id || 'Unknown',
          variantId: '',
          variants: [],
          isAvailable: false,
          description: productDescriptions[product.id] || 'No description available.',
        };
      }
    })
  );

  return productsWithVariants;
});