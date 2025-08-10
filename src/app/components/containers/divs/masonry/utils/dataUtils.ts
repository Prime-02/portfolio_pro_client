import { PaginationConfig } from "@/app/components/types and interfaces/masonry";

export const getNestedValue = (obj: any, path: string): any => {
  if (!path) return obj;
  return path.split(".").reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, obj);
};

export const extractDataFromResponse = (responseData: any, dataPath?: string): any[] => {
  if (!responseData) return [];
  if (!dataPath) {
    if (Array.isArray(responseData)) return responseData;
    if (responseData.data && Array.isArray(responseData.data))
      return responseData.data;
    if (responseData.results && Array.isArray(responseData.results))
      return responseData.results;
    if (responseData.items && Array.isArray(responseData.items))
      return responseData.items;
    return [];
  }
  const extractedData = getNestedValue(responseData, dataPath);
  return Array.isArray(extractedData) ? extractedData : [];
};

export const extractPaginationInfo = (
  responseData: any,
  page: number,
  defaultLimit: number = 20
): PaginationConfig => {
  let paginationInfo: PaginationConfig = {};

  if (responseData?.pagination) {
    paginationInfo = { ...responseData.pagination };
  } else if (responseData?.total !== undefined) {
    const totalPages = Math.ceil(responseData.total / defaultLimit);
    paginationInfo = {
      totalItems: responseData.total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      page,
    };
  } else if (responseData?.meta) {
    const meta = responseData.meta;
    paginationInfo = {
      totalItems: meta.total || meta.totalCount,
      totalPages: meta.totalPages || meta.lastPage,
      hasNextPage: meta.hasNextPage || page < (meta.totalPages || meta.lastPage),
      hasPrevPage: meta.hasPrevPage || page > 1,
      page: meta.currentPage || page,
    };
  } else {
    const dataArray = extractDataFromResponse(responseData);
    paginationInfo = {
      hasNextPage: dataArray.length === defaultLimit,
      hasPrevPage: page > 1,
      page,
    };
  }
  return paginationInfo;
};
