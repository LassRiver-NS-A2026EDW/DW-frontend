interface ReviewCommentProps {
  children: string;
}

export function ReviewComment({ children }: ReviewCommentProps) {
  return (
    <p className="max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-muted-foreground leading-relaxed">
      {children}
    </p>
  );
}
