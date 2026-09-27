export const businessConfig = {
  whatsappNumber: "", // Empty for now, owner will provide
  instagramHandle: "@_gift_house_13"
};

export const generateWhatsAppUrl = (product = null, settings = null, orderDetails = null) => {
  const whatsappNumber = settings?.whatsappNumber || "";
  const cleanNumber = String(whatsappNumber).replace(/[^0-9]/g, '');

  if (!cleanNumber) return null;
  
  const businessName = settings?.businessName || 'Gift House';
  let message = `Hi, I'm interested in ordering from ${businessName}.`;
  
  if (product) {
    const categoryLabel = product.categoryName || product.collection || 'Gift';
    const priceText = String(product.price).includes('₹') ? product.price : `₹${product.price}`;
    
    if (orderDetails) {
      message = `Hi, I'm interested in ordering from ${businessName}. 🎁\n\nProduct: ${product.title}\nPrice: ${priceText}\nCategory: ${categoryLabel}\n\nCustomer Name: ${orderDetails.name}\nQuantity: ${orderDetails.quantity}\nDelivery Location: ${orderDetails.location}\nRequired Delivery Date: ${orderDetails.date}`;
      if (orderDetails.specialInstructions?.trim()) {
        message += `\n\nSpecial Instructions: ${orderDetails.specialInstructions}`;
      }
      message += `\n\nPlease confirm availability, delivery charges and total price.\n\nThank you!`;
    } else {
      message = `Hi, I'm interested in ordering from ${businessName}. 🎁\n\nProduct: ${product.title}\nPrice: ${priceText}\nCategory: ${categoryLabel}\n\nQuantity: [Customer will fill]\nDelivery Location: [Customer will fill]\nRequired Delivery Date: [Customer will fill]\n\nPlease confirm availability and total price.\n\nThank you!`;
    }
  }
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const handleWhatsAppOrder = (product = null, settings = null) => {
  const url = generateWhatsAppUrl(product, settings);
  if (!url) {
    alert("WhatsApp ordering will be connected once the business owner provides the WhatsApp number in the admin settings.");
    return;
  }
  
  console.log("PRODUCT WHATSAPP CLICK", {
    product,
    whatsappNumber: settings?.whatsappNumber,
    whatsappUrl: url
  });

  window.open(url, '_blank', 'noopener,noreferrer');
};
