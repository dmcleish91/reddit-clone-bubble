'use client';
import useCustomToast from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { VoteType } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { PostVoteRequest } from '@/lib/validators/vote';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

type PostVoteClientProps = {
  postId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
};

export default function PostVoteClient({ postId, initialVotesAmount, initialVote }: PostVoteClientProps) {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState<'UP' | 'DOWN' | null | undefined>(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };
      console.log(payload);
      await axios.patch('/api/subreddit/post/vote', payload);
    },
    onError: (err, voteType) => {
      if (voteType === 'UP') {
        setVotesAmount((prev) => prev - 1);
      } else {
        setVotesAmount((prev) => prev + 1);
      }

      //reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          loginToast();
        }
      }

      return toast({
        title: 'Something went wrong!',
        description: "Couldn't vote on post",
        variant: 'destructive',
      });
    },
    onMutate: (updatedVoteType: VoteType) => {
      if (currentVote === updatedVoteType) {
        setCurrentVote(undefined);
        if (updatedVoteType === 'UP') {
          setVotesAmount((prev) => prev - 1);
        } else if (updatedVoteType === 'DOWN') {
          setVotesAmount((prev) => prev + 1);
        }
      } else {
        setCurrentVote(updatedVoteType);
        if (updatedVoteType === 'UP') {
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        } else if (updatedVoteType === 'DOWN') {
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
      <Button size='sm' variant='ghost' aria-label='Upvote' onClick={() => vote('UP')}>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', { 'text-emerald-500 fill-emerald-500': currentVote === 'UP' })}
        />
      </Button>

      <p className='text-center py-2 font-medium text-sm text-zinc-900'>{votesAmount}</p>

      <Button size='sm' variant='ghost' aria-label='Upvote' onClick={() => vote('DOWN')}>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', { 'text-red-500 fill-red-500': currentVote === 'DOWN' })}
        />
      </Button>
    </div>
  );
}
