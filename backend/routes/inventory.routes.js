import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";

console.log("🔥 INVENTORY ROUTES LOADED");

const router = express.Router();

router.get(
    "/overview",
    inventoryController.getInventoryOverview
);

router.get(
    "/raw-materials",
    inventoryController.getRawMaterials
);

router.post(
    "/raw-materials",
    inventoryController.createRawMaterial
);

router.post(
    "/purchase-orders",
    inventoryController.createPurchaseOrder
);

router.get(
    "/purchase-orders/:id",
    inventoryController.getPurchaseOrderDetail
);

router.post(
    "/purchase-orders/:id/items",
    inventoryController.addItemToPO
);

router.delete(
    "/purchase-orders/:poId/items/:itemId",
    inventoryController.deleteItemFromPO
);

router.post(
    "/purchase-orders/:id/complete",
    inventoryController.completePurchaseOrder
);

export default router;
