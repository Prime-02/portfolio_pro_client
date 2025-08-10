import { DistributionStrategy } from "@/app/components/types and interfaces/masonry";

// utils/distributionStrategies.ts
export const getDistributionOrder = (
  columnCount: number,
  strategy: DistributionStrategy
): number[] => {
  switch (strategy) {
    case "left-to-right":
      return Array.from({ length: columnCount }, (_, i) => i);
      
    case "right-to-left":
      return Array.from({ length: columnCount }, (_, i) => columnCount - 1 - i);
      
    case "center-out":
      const center = Math.floor(columnCount / 2);
      const order: number[] = [];
      if (columnCount === 1) return [0];
      if (columnCount === 2) return [0, 1];
      order.push(center);
      for (let i = 1; i <= center; i++) {
        if (center + i < columnCount) order.push(center + i);
        if (center - i >= 0) order.push(center - i);
      }
      return order;
      
    case "random":
      const indices = Array.from({ length: columnCount }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return indices;
      
    case "balanced":
    default:
      return Array.from({ length: columnCount }, (_, i) => i);
  }
};