import { Post, Vote, VoteType } from '@prisma/client';
import { notFound } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import PostVoteClient from './postvoteclient';
import { getVotesAmount } from '@/lib/utils';

type PostVoteServerProps = {
  postId: string;
  initialVotesAmount?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
};

export default async function PostVoteServer({
  postId,
  initialVotesAmount,
  initialVote,
  getData,
}: PostVoteServerProps) {
  const session = await getAuthSession();

  let _votesAmount: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();

    if (!post) return notFound();

    _votesAmount = getVotesAmount(post.votes);

    _currentVote = post.votes.find((vote) => vote.userId === session?.user.id)?.type;
  } else {
    _votesAmount = initialVotesAmount!;
    _currentVote = initialVote;
  }

  return <PostVoteClient postId={postId} initialVotesAmount={_votesAmount} initialVote={_currentVote} />;
}
