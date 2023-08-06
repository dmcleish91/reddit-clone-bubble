import PostVoteServer from '@/components/post-vote/postvoteserver';
import { buttonVariants } from '@/components/ui/button';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { CachePost } from '@/types/redis-types';
import { Post, User, Vote } from '@prisma/client';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

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
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return await db.post.findUnique({
                where: {
                  id: params.postId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}

function PostVoteShell() {
  return (
    <div className='flex items-center flex-col pr-6 w-20'>
      {/*Upvote*/}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className='h-5 w-5 text-zinc-700' />
      </div>

      {/*Score*/}
      <div className='text-center py-2 font-medium text-sm text-zinc-900'>
        <Loader2 className='h3 w-3 animate-spin' />
      </div>

      {/*Downvote*/}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  );
}
