import ContentLoader from "react-content-loader";

const MessageSkeleton = (props: any) => {
  return (
    <ContentLoader viewBox="0 0 500 50" height={20} width={170} {...props}>
      <rect x="0" y="0" rx="5" ry="15" width="500" height="50" />
    </ContentLoader>
  );
};

export default MessageSkeleton;
