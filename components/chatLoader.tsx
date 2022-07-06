import ContentLoader from "react-content-loader";

const ChatSkeleton = (props: any) => {
  return (
    <ContentLoader
      viewBox="0 0 300 400"
      height={window.innerHeight}
      width={450}
      {...props}
    >
      <rect x="0" y="0" rx="10" ry="10" width="200" height="20" />
      <rect x="90" y="40" rx="10" ry="10" width="200" height="20" />
      <rect x="90" y="70" rx="10" ry="10" width="200" height="20" />
      <rect x="0" y="110" rx="10" ry="10" width="200" height="100" />
      <rect x="90" y="230" rx="10" ry="10" width="200" height="20" />
    </ContentLoader>
  );
};

export default ChatSkeleton;
