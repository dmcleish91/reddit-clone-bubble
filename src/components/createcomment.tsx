'use client';
import { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Button } from './ui/button';
import { CommentRequest } from '@/lib/validators/comment';
import { toast } from '@/hooks/use-toast';
import useCustomToast from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';

type CreateCommentProps = {
  user: String;
  postId: string;
  replyToId?: string;
};

export default function CreateComment({ user, postId, replyToId }: CreateCommentProps) {
  const [input, setInput] = useState<string>('');
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch('/api/subreddit/post/comment', payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'There was a problem',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput('');
    },
  });

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>
        Comment as <span>u/{user}</span>
      </Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder='Join the conversation!'
        />

        <div className='mt-2 flex justify-end'>
          <Button
            onClick={() => comment({ postId, text: input, replyToId })}
            isLoading={isLoading}
            disabled={input.length === 0}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
