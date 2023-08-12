'use client';
import useCustomToast from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { CommentVote, VoteType } from '@prisma/client';
import { useState } from 'react';

import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { CommentVoteRequest } from '@/lib/validators/vote';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type CommentVotesProps = {
  commentId: string;
  initialVotesAmount: number;
  initialVote?: Pick<CommentVote, 'type'>;
};

export default function CommentVotes({ commentId, initialVotesAmount, initialVote }: CommentVotesProps) {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);
  const session = useSession();

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch('/api/subreddit/post/comment/vote', payload);
    },
    onError: (err, voteType) => {
      if (session.status === 'authenticated') {
        if (voteType === 'UP') {
          setVotesAmount((prev) => prev - 1);
        } else {
          setVotesAmount((prev) => prev + 1);
        }
      }

      //reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'Something went wrong!',
        description: "Couldn't vote on post",
        variant: 'destructive',
      });
    },
    onMutate: (type) => {
      if (session.status === 'authenticated') {
        if (currentVote?.type === type) {
          setCurrentVote(undefined);
          if (type === 'UP') {
            setVotesAmount((prev) => prev - 1);
          } else if (type === 'DOWN') {
            setVotesAmount((prev) => prev + 1);
          }
        } else {
          setCurrentVote({ type });
          if (type === 'UP') {
            setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
          } else if (type === 'DOWN') {
            setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
          }
        }
      }
    },
  });

  return (
    <div className='flex gap-1'>
      <Button size='xs' variant='ghost' aria-label='Upvote' onClick={() => vote('UP')}>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', { 'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP' })}
        />
      </Button>

      <p className='text-center py-2 font-medium text-sm text-zinc-900'>{votesAmount}</p>

      <Button size='xs' variant='ghost' aria-label='Upvote' onClick={() => vote('DOWN')}>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', { 'text-red-500 fill-red-500': currentVote?.type === 'DOWN' })}
        />
      </Button>
    </div>
  );
}
