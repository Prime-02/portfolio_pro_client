import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
  SearchPlaceIndexForSuggestionsCommand,
  GetPlaceCommand,
} from "@aws-sdk/client-location";

interface PlaceResult {
  PlaceId: string;
  Place: {
    Label: string;
    Country?: string;
    Region?: string;
    Municipality?: string;
    Geometry?: {
      Point: [number, number];
    };
  };
}

interface SuggestionResult {
  Text: string;
  PlaceId?: string;
}

interface SearchOptions {
  maxResults?: number;
  biasPosition?: [number, number];
  filterCountries?: string[];
}

// Configure client with API key authentication
const locationClient = new LocationClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: "dummy", // Required but not used with API keys
    secretAccessKey: "dummy", // Required but not used with API keys
  },
});

export async function searchPlaces(
  query: string,
  options: SearchOptions = {}
): Promise<PlaceResult[]> {
  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: "portfolio_pro_locator",
      Text: query,
      MaxResults: options.maxResults || 50,
      ...(options.biasPosition && { BiasPosition: options.biasPosition }),
      ...(options.filterCountries && {
        FilterCountries: options.filterCountries,
      }),
    });

    // Add API key to the request headers
    command.middlewareStack.add(
      (next, context) => async (args) => {
        args.request.headers = {
          ...args.request.headers,
          "X-Amz-Api-Key": process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY!,
        };
        return next(args);
      },
      {
        step: "build",
        name: "addApiKeyHeader",
      }
    );

    const response = await locationClient.send(command);
    return (response.Results || []) as PlaceResult[];
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
}

export async function getSuggestions(
  query: string,
  options: SearchOptions = {}
): Promise<SuggestionResult[]> {
  try {
    const command = new SearchPlaceIndexForSuggestionsCommand({
      IndexName: "portfolio_pro_locator",
      Text: query,
      MaxResults: options.maxResults || 10,
      ...(options.biasPosition && { BiasPosition: options.biasPosition }),
      ...(options.filterCountries && {
        FilterCountries: options.filterCountries,
      }),
    });

    // Add API key to the request headers
    command.middlewareStack.add(
      (next, context) => async (args) => {
        args.request.headers = {
          ...args.request.headers,
          "X-Amz-Api-Key": process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY!,
        };
        return next(args);
      },
      {
        step: "build",
        name: "addApiKeyHeader",
      }
    );

    const response = await locationClient.send(command);
    return (response.Results || []).map((result) => ({
      Text: result.Text || "",
      PlaceId: result.PlaceId,
    }));
  } catch (error) {
    console.error("Error getting suggestions:", error);
    throw error;
  }
}

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceResult | null> {
  try {
    const command = new GetPlaceCommand({
      IndexName: "portfolio_pro_locator",
      PlaceId: placeId,
    });

    // Add API key to the request headers
    command.middlewareStack.add(
      (next, context) => async (args) => {
        args.request.headers = {
          ...args.request.headers,
          "X-Amz-Api-Key": process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY!,
        };
        return next(args);
      },
      {
        step: "build",
        name: "addApiKeyHeader",
      }
    );

    const response = await locationClient.send(command);

    if (response.Place) {
      return {
        PlaceId: placeId,
        Place: response.Place,
      } as PlaceResult;
    }

    return null;
  } catch (error) {
    console.error("Error getting place details:", error);
    throw error;
  }
}
