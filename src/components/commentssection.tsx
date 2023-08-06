import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getVotesAmount } from '@/lib/utils';
import PostComment from './postcomment';
import CreateComment from './createcomment';

type CommentsSectionProps = {
  postId: string;
};

export default async function CommentsSection({ postId }: CommentsSectionProps) {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />

      {/* TODO: Create comment */}
      <CreateComment postId={postId} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmount = getVotesAmount(topLevelComment.votes);
            const topLevelCommentVote = topLevelComment.votes.find((vote) => vote.userId === session?.user.id)?.type;

            return (
              <div key={topLevelComment.id} className='flex flex-col'>
                <div className='mb-2'>
                  <PostComment comment={topLevelComment} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
