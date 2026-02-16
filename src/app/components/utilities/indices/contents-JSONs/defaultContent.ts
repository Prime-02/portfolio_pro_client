import {
  ContentStatus,
  ContentType,
  ContentWithAuthor,
} from "@/app/components/types and interfaces/Posts";

export const defaultContent: ContentWithAuthor = {
  title: "",
  status: ContentStatus.DRAFT,
  content_type: ContentType.POST,
  id: "",
  user_id: "",
  body: [],
  is_featured: false,
  is_pinned: false,
  is_public: true,
  allow_comments: true,
  allow_likes: true,
  allow_reshare: true,
  views_count: 0,
  likes_count: 0,
  shares_count: 0,
  created_at: "",
  updated_at: "",
  published_at: "",
  is_liked: false,
  is_shared: false,
  comments_count: 0,
};
