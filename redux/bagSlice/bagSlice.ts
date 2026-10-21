import { BagItem } from "@/interfaces/BagItem";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppliedPromotion {
  id: string;
  name: string;
  discount: number;
}

interface BagSlice {
  bag: BagItem[];
  showBag: boolean;
  couponCode: string | null;
  couponDiscount: number;
  promotionId: string | null; // Primary (backward compat)
  promotionIds: string[]; // All stacked promotion IDs
  promotionDiscount: number; // Total combined discount
  appliedPromotions: AppliedPromotion[]; // Detailed breakdown
}

const initialState: BagSlice = {
  bag: [],
  showBag: false,
  couponCode: null,
  couponDiscount: 0,
  promotionId: null,
  promotionIds: [],
  promotionDiscount: 0,
  appliedPromotions: [],
};

const bagSlice = createSlice({
  name: "bag",
  initialState,
  reducers: {
    initializeBag(state) {
      const bag = window.localStorage.getItem("NEVERBEBag");
      const couponCode = window.localStorage.getItem("NEVERBECouponCode");
      const couponDiscount = window.localStorage.getItem("NEVERBEDiscount");

      if (bag) {
        state.bag = JSON.parse(bag);
      } else {
        state.bag = [];
        window.localStorage.setItem("NEVERBEBag", JSON.stringify([]));
      }

      if (couponCode) state.couponCode = couponCode;
      if (couponDiscount) state.couponDiscount = Number(couponDiscount);
      // Note: promotions are session-only, not persisted
    },
    applyCoupon(state, action) {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
      window.localStorage.setItem("NEVERBECouponCode", action.payload.code);
      window.localStorage.setItem(
        "NEVERBEDiscount",
        action.payload.discount.toString()
      );
    },
    removeCoupon(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
      window.localStorage.removeItem("NEVERBECouponCode");
      window.localStorage.removeItem("NEVERBEDiscount");
    },
    applyPromotion(
      state,
      action: PayloadAction<{ id: string; name?: string; discount: number }>
    ) {
      // Single promotion - backward compatibility
      state.promotionId = action.payload.id;
      state.promotionIds = [action.payload.id];
      state.promotionDiscount = action.payload.discount;
      state.appliedPromotions = [
        {
          id: action.payload.id,
          name: action.payload.name || "Promotion",
          discount: action.payload.discount,
        },
      ];
    },
    // New action for applying multiple stacked promotions
    applyPromotions(
      state,
      action: PayloadAction<{ id: string; name: string; discount: number }[]>
    ) {
      const promotions = action.payload;
      if (promotions.length === 0) {
        state.promotionId = null;
        state.promotionIds = [];
        state.promotionDiscount = 0;
        state.appliedPromotions = [];
        return;
      }

      state.promotionId = promotions[0].id; // Primary for backward compat
      state.promotionIds = promotions.map((p) => p.id);
      state.promotionDiscount = promotions.reduce(
        (sum, p) => sum + p.discount,
        0
      );
      state.appliedPromotions = promotions;
    },
    removePromotion(state) {
      state.promotionId = null;
      state.promotionIds = [];
      state.promotionDiscount = 0;
      state.appliedPromotions = [];
    },

    addToBag(state, action) {
      let itemBag: any = window.localStorage.getItem("NEVERBEBag");
      if (itemBag) {
        itemBag = JSON.parse(itemBag) as BagItem[];
        let doesExist = false;
        state.bag = itemBag.map((item: BagItem) => {
          if (
            item.itemId === action.payload.itemId &&
            item.variantId === action.payload.variantId &&
            item.size === action.payload.size
          ) {
            item.quantity += action.payload.quantity;
            item.discount += action.payload.discount;
            doesExist = true;
            return item;
          }
          return item;
        });
        if (!doesExist) {
          state.bag.push(action.payload);
        }
      }
      window.localStorage.setItem("NEVERBEBag", JSON.stringify(state.bag));
    },
    addMultipleToBag(state, action: PayloadAction<BagItem[]>) {
      const newItems = action.payload;
      let currentBag: BagItem[] = [...state.bag];

      newItems.forEach((newItem) => {
        const existingIndex = currentBag.findIndex(
          (item) =>
            item.itemId === newItem.itemId &&
            item.variantId === newItem.variantId &&
            item.size === newItem.size
        );

        if (existingIndex > -1) {
          currentBag[existingIndex].quantity += newItem.quantity;
          currentBag[existingIndex].discount += newItem.discount;
        } else {
          currentBag.push(newItem);
        }
      });

      state.bag = currentBag;
      window.localStorage.setItem("NEVERBEBag", JSON.stringify(state.bag));
    },
    removeFromBag(state, action) {
      const items = window.localStorage.getItem("NEVERBEBag");
      state.bag = JSON.parse(<string>items).filter(
        (item: BagItem) =>
          item.itemId !== action.payload.itemId ||
          item.variantId !== action.payload.variantId ||
          item.size !== action.payload.size
      );
      window.localStorage.setItem("NEVERBEBag", JSON.stringify(state.bag));
    },
    updateQuantity(state, action) {
      const { itemId, variantId, size, quantity } = action.payload;
      const item = state.bag.find((item) => item.itemId === itemId && item.variantId === variantId && item.size === size);
      if (item && Number.isInteger(quantity) && quantity >= 1 && quantity <= (item.maxQuantity || 10) && !item.isComboItem) {
        item.discount = item.quantity > 0 ? Math.round((item.discount / item.quantity) * quantity) : 0;
        item.quantity = quantity;
      }
      window.localStorage.setItem("NEVERBEBag", JSON.stringify(state.bag));
    },
    showBag(state) {
      state.showBag = true;
    },
    hideBag(state) {
      state.showBag = false;
    },
    clearBag(state) {
      state.bag = [];
      window.localStorage.setItem("NEVERBEBag", JSON.stringify([]));
    },
    // Remove all items from a specific combo
    removeComboFromBag(state, action: PayloadAction<string>) {
      const comboId = action.payload;
      state.bag = state.bag.filter((item) => item.comboId !== comboId);
      window.localStorage.setItem("NEVERBEBag", JSON.stringify(state.bag));
    },
  },
});

export const {
  initializeBag,
  addToBag,
  removeFromBag,
  clearBag,
  updateQuantity,
  showBag,
  hideBag,
  applyCoupon,
  removeCoupon,
  applyPromotion,
  applyPromotions,
  removePromotion,
  addMultipleToBag,
  removeComboFromBag,
} = bagSlice.actions;
export default bagSlice.reducer;
