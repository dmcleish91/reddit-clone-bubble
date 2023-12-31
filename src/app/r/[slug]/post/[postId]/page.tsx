import CommentsSection from '@/components/commentssection';
import EditorOutput from '@/components/editoroutput';
import PostVoteServer from '@/components/post-vote/postvoteserver';
import { buttonVariants } from '@/components/ui/button';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { Post, User, Vote } from '@prisma/client';
import { ArrowBigDown, ArrowBigUp, Loader, Loader2 } from 'lucide-react';
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
  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  post = await db.post.findFirst({
    where: {
      id: params.postId,
    },
    include: {
      votes: true,
      author: true,
    },
  });

  if (!post) return notFound();

  return (
    <div>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id}
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

        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
          <p className='max-h-40 mt-1 turncate text-xs text-gray-500'>
            Posted by u/{post?.author.username} {formatTimeToNow(new Date(post?.createdAt))}
          </p>
          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-500'>{post?.title}</h1>

          <EditorOutput content={post?.content} />

          <Suspense fallback={<Loader2 className='h-5 w-5 animate-spin text-zonc-500' />}>
            <CommentsSection postId={post?.id} />
          </Suspense>
        </div>
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
        <Loader2 className='h-3 w-3 animate-spin' />
      </div>

      {/*Downvote*/}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  );
}
