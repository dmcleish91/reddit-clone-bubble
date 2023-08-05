import { redis } from '@/lib/redis';
import { CachePost } from '@/types/redis-types';
import { Post, User, Vote } from '@prisma/client';

type PageProps = {
  params: {
    postId: string;
  };
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function Page({ params }: PageProps) {
  const cachedPost = (await redis.hgetall(`post:${params.postId}`)) as CachePost;

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
  }

  return <div>page</div>;
}
