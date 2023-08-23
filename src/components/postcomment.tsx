'use client';
import { useRef, useState } from 'react';
import UserAvatar from './useravatar';
import { Comment, CommentVote, User } from '@prisma/client';
import { formatTimeToNow } from '@/lib/utils';
import CommentVotes from './commentvotes';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { CommentRequest } from '@/lib/validators/comment';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

type PostCommentProps = {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote: CommentVote | undefined;
  postId: string;
};

export default function PostComment({ comment, votesAmount, currentVote, postId }: PostCommentProps) {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useOnClickOutside(commentRef, () => {
    setIsReplying(false);
  });

  function createReply() {
    if (!session) router.push('/sign-in');
    setIsReplying(true);
  }

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch('/api/subreddit/post/comment', payload);
      return data;
    },
    onError: () => {
      return toast({
        title: 'Something went wrong',
        description: 'Comment was not posted succesfully',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      setInput('');
      router.refresh();
      setIsReplying(false);
    },
  });

  return (
    <div className='flex flex-col' ref={commentRef}>
      <div className='flex items-center'>
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className='h-6 w-6'
        />
        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>u/{comment.author.username}</p>
          <p className='max-h-40 truncate text-xs text-zinc-500'>{formatTimeToNow(new Date(comment.createdAt))}</p>
        </div>
      </div>

      <p className='text-sm text-zinc-900 mt-2 ml-8'>{comment.text}</p>

      <div className='flex flex-row flex-wrap gap-2 items-center'>
        <CommentVotes commentId={comment.id} initialVotesAmount={votesAmount} initialVote={currentVote} />

        <Button variant='ghost' size='xs' onClick={() => createReply()}>
          <MessageSquare className='h-4 w-4 mr-1.5' />
          Reply
        </Button>

        {isReplying ? (
          <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
              <Textarea
                id='comment'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder='Have something to say?'
              />

              <div className='mt-2 flex justify-end gap-2'>
                <Button tabIndex={-1} variant='secondary' onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!input) return;
                    postComment({ postId, text: input, replyToId: comment.replyToId ?? comment.id });
                  }}
                  isLoading={isLoading}
                  disabled={input.length === 0}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
