export const ItemCategory = {
  CLOTHES: 'clothes',
  MISCELLANEOUS: 'miscellaneous',
  GADGET: 'gadget',
  STATIONARY: 'stationary',
  BOOKS: 'books',
  NULL: 'null', // Useful for uncategorized items
};

// A helper to get a clean display name
export const getCategoryLabel = (category) => {
  switch (category) {
    case ItemCategory.CLOTHES: return 'Clothes & Apparel';
    case ItemCategory.GADGET: return 'Electronics & Gadgets';
    case ItemCategory.STATIONARY: return 'Stationary & Supplies';
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
};