export function formatPrice(value: number | string, discount: number = 0) {
    let numericValue = typeof value === "string"
        ? Number(value.replace(/[^\d]/g, ""))
        : value;

    const discountPercentage = Number(discount);
    if (discountPercentage > 0 && numericValue > 0) {
        numericValue = numericValue - (numericValue * (discountPercentage / 100));
    }


    return `${new Intl.NumberFormat("vi-VN").format(Math.round(numericValue))} VND`;
}

export function formatSalePrice(rawPrice: string | number, discount: number = 0): string {
    const price = typeof rawPrice === 'string' ? Number(rawPrice.replace(/[^0-9.-]+/g, "")) : Number(rawPrice);

    let finalPrice = price;
    if (discount && discount > 0) {
        finalPrice = price + (price * (discount / 100));
    }
    return `${new Intl.NumberFormat('vi-VN').format(Math.round(finalPrice))} VND`;
}