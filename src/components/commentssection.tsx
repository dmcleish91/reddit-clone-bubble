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
      <CreateComment postId={postId} user={session?.user.username ?? ''} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmount = getVotesAmount(topLevelComment.votes);
            const topLevelCommentVote = topLevelComment.votes.find((vote) => vote.userId === session?.user.id);

            return (
              <div key={topLevelComment.id} className='flex flex-col'>
                <div className='mb-2'>
                  <PostComment
                    comment={topLevelComment}
                    votesAmount={topLevelCommentVotesAmount}
                    currentVote={topLevelCommentVote}
                    postId={postId}
                  />
                </div>

                {/* render replies */}

                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmount = getVotesAmount(topLevelComment.votes);
                    const replyVote = topLevelComment.votes.find((vote) => vote.userId === session?.user.id);
                    return (
                      <div key={reply.id} className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
                        <PostComment
                          comment={reply}
                          votesAmount={replyVotesAmount}
                          currentVote={replyVote}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
}
