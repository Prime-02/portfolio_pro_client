import React from "react";
import InfiniteScrollDiv from "./InfiniteScrollDiv "; // Adjust import path as needed

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const ExampleUsage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Infinite Scroll Example
      </h1>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Posts Feed</h2>
        </div>

        <div className="h-96">
          <InfiniteScrollDiv
            baseUrl="https://jsonplaceholder.typicode.com/posts"
            skipParam="_start"
            limitParam="_limit"
            initialLimit={10}
            threshold={50}
          >
            {({ data, loading, error, hasMore, refetch }) => (
              <div className="p-4">
                {/* Refetch button */}
                <div className="mb-4">
                  <button
                    onClick={refetch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {/* Data rendering */}
                {data.map((post: Post, index: number) => (
                  <div
                    key={post.id || index}
                    className="border-b pb-4 mb-4 last:border-b-0"
                  >
                    <h3 className="font-semibold text-lg mb-2 capitalize">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{post.body}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Post ID: {post.id} | User ID: {post.userId}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {!loading && data.length === 0 && !error && (
                  <div className="text-center py-8 text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            )}
          </InfiniteScrollDiv>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;
