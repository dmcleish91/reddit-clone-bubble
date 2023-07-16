'use client';
import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit';
import axios, { AxiosError } from 'axios';
import useCustomToast from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';

type SubscribeToggle = {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
};

export default function SubscribeToggle({ subredditId, subredditName, isSubscribed }: SubscribeToggle) {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.post('/api/subreddit/subscribe', payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'There was a problem',
        description: 'Something went wrong, please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        return router.refresh();
      });

      return toast({
        title: 'Subscribed',
        description: `You are now subscribed to r/${subredditName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.post('/api/subreddit/unsubscribe', payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'There was a problem',
        description: 'Something went wrong, please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        return router.refresh();
      });

      return toast({
        title: 'Unsubscribed',
        description: `You are now unsubscribed from r/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button className='w-full mt-1 mb-4' onClick={() => unsubscribe()} isLoading={isUnsubLoading}>
      Leave
    </Button>
  ) : (
    <Button className='w-full mt-1 mb-4' onClick={() => subscribe()} isLoading={isSubLoading}>
      Join
    </Button>
  );
}
