export function filteredEnabled(menu: any) {
  return menu
    .filter((item: any) => item.enable)
    .map((item: any) => {
      const newItem: any = { ...item };

      // Recursively process nested objects and arrays
      for (const key in newItem) {
        if (Array.isArray(newItem[key])) {
          newItem[key] = filteredEnabled(newItem[key]);
        } else if (typeof newItem[key] === "object" && newItem[key] !== null) {
          newItem[key] = filteredEnabled([newItem[key]])[0] || {};
        }
      }

      return newItem;
    });
}
